from langchain.schema import Document
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    PromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
    )
from langchain_core.messages import HumanMessage,AIMessage
from langchain.chains.combine_documents.stuff import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.summarize import load_summarize_chain
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from app import llm,vectorStore,elevenLabClient,openai
from langchain_community.document_loaders.web_base import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import tempfile
import os
from langchain_community.document_loaders import ConfluenceLoader
import re
from urllib.parse import urlparse


messsage_history = dict()
sessions = dict()
creds = dict()


def is_confluence_link(url: str) -> bool:
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    path = parsed.path.lower()

    # Common Confluence URL patterns:
    confluence_domains = [
        "atlassian.net",
        # Add your custom Confluence domains here, e.g.:
        # "confluence.yourcompany.com",
    ]

    # Check domain contains known Confluence domain substrings
    if not any(d in domain for d in confluence_domains):
        return False

    # Check path patterns typical for Confluence pages
    confluence_path_patterns = [
        r"^/wiki/",
        r"^/display/",
        r"^/pages/viewpage.action",
        r"^/spaces/",
    ]

    if any(re.match(pattern, path) for pattern in confluence_path_patterns):
        return True

    return False

def readConfluencePages(session_id:str,link:str,
                        base_url:str,api_key:str,username:str,page_id:str):
    loader = ConfluenceLoader(
        url=base_url,
        username=username,
        api_key=api_key,
        include_attachments=False,
        limit=50,
        page_ids=[page_id]
    )
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    docs = text_splitter.split_documents(documents)
    print(docs)
    creds[session_id] = [base_url,api_key,username,page_id]
    for doc in docs:
        if doc.metadata is None:
            doc.metadata = {}
        doc.metadata["session_id"] = session_id
    return docs

def readLinkAndGetDocs(session_id:str,link:str):
    docs = []
    loader = WebBaseLoader(web_path=link)
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    docs = text_splitter.split_documents(documents)
    
    for doc in docs:
        if doc.metadata is None:
            doc.metadata = {}
        doc.metadata["session_id"] = session_id

    return docs

def summarizeLink(session_id:str,link:str):
    docs = []
    if is_confluence_link(link):
        cred = creds[session_id]
        # print("Conf creds : " , cred)
        docs = readConfluencePages(session_id,link,cred[0],cred[1],cred[2],cred[3])
    else:    
        docs = readLinkAndGetDocs(session_id,link)    
    summarize_chain = load_summarize_chain(llm, chain_type="map_reduce")
    summary   = summarize_chain.invoke(docs)
    # print("Summary")
    # print(summary['output_text'])
    return summary['output_text']


# async def uploadLinkToVectorStore(session_id:str,link:str):
#     docs = readLinkAndGetDocs(session_id,link)
#     vectorStore.add_documents(docs)
    
async def addDocument(session_id:str,link:str):
    print("Add document")
    session = sessions.get(session_id)
    if session is not None:
        raise Exception("Session already exists")
    session = {
        "session_id" : session_id,
        "stage":"UPLOAD",
        "state":"READING",
        "link":link
    }
    sessions[session_id] = session
    # await uploadLinkToVectorStore(session_id,link)
    docs = readLinkAndGetDocs(session_id,link)
    vectorStore.add_documents(docs)


async def addConfluenceDocuments(session_id:str,link:str,base_url:str="",api_key:str="",username:str="",page_id:str=""):
    docs = readConfluencePages(session_id,link,base_url,api_key,username,page_id)
    vectorStore.add_documents(docs)


async def resetSession(session_id:str):
    vectorStore.delete_by_metadata_filter(filter={"session_id":session_id})


def getAudioForTheText(text:str):
    audio_stream = elevenLabClient.text_to_speech.convert_as_stream(
        text=text,
        voice_id="CwhRBWXzGAHq8TQ4Fs17",
        model_id="eleven_multilingual_v2",
        # format="mp3"
    )

    return audio_stream

def getAnswerUsingVectorResult(session_id:str,question:str):
    retriever = vectorStore.as_retriever(search_kwargs={
        "filter":{"session_id":session_id}
    })
    # docs = retriever.invoke(question)
    # print(docs)
    prompt =  ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template("""
          You are a chatbot that answers questions based on the knowledge provided.
          Answer the user's questions based on the below context.
          Also note, keep the answers very brief, mostly upto 3 sentences.
          Format your messages as a script which would be used by an assistant as it is .\n\n"
          Context: {context}
         """),
         MessagesPlaceholder('chat_history'),
         HumanMessagePromptTemplate.from_template("{input}")
    ])

    chat_history:list = messsage_history.get(session_id,[])
    
    combine_docs_chain = create_stuff_documents_chain(
            llm=llm,
            prompt=prompt,
            document_prompt=PromptTemplate.from_template(
            "Page link: {source}\n\nPage content:\n{page_content}",
            ),
            document_separator= "\n--------\n",
        )

    retrieval_chain = create_retrieval_chain(
        combine_docs_chain=combine_docs_chain,
        retriever=retriever
        )


    response = retrieval_chain.invoke({
        "input":question,
        "chat_history":chat_history
    })

    chat_history.append(HumanMessage(content=question))
    chat_history.append(AIMessage(content=response["answer"]))

    messsage_history[session_id] = chat_history

    # print(response)
    # pprint.pp(response)
    return response['answer']

def cosine_to_confidence_linear(cos_sim: float) -> float:
   """Convert cosine similarity [-1,1] to confidence percentage [0,100]."""
   return ((cos_sim + 1) / 2) * 100

def getConfidenceScore(session_id:str,question:str):
   try:
       results_with_scores = vectorStore.similarity_search_with_relevance_scores(question,k=4,
                                                                               filter={"session_id":session_id})
       confidence_scores = []
       for doc, score in results_with_scores:
           print(f"Score: {score:.3f}  scoreO = {score}")
           confidence_pct = cosine_to_confidence_linear(score)
           confidence_scores.append(confidence_pct)
       if confidence_scores:
           cumulative_confidence = sum(confidence_scores) / len(confidence_scores)
       else:
           cumulative_confidence = 0.0
       return cumulative_confidence
   except Exception as e:
       print(f"Error calculating confidence score for {session_id} : " , e )
       return 78

def transcribe(audio_content):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
        temp_file.write(audio_content.read())
        temp_file_name = temp_file.name

    with open(temp_file_name, "rb") as audio_file:
        transcription = openai.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )

    os.remove(temp_file_name)
    return transcription.text