from fastapi import APIRouter, UploadFile,File, WebSocket,Request
from app import llm, vectorStore, embeddings
from langchain.prompts import PromptTemplate
from fastapi.responses import JSONResponse,StreamingResponse,HTMLResponse
from ..controller.chain import (addDocument,getAnswerUsingVectorResult,
                                getAudioForTheText,transcribe,resetSession,
                                summarizeLink,addConfluenceDocuments,getConfidenceScore
                                )
from logger import logger

import io

router = APIRouter()

@router.get("/")
async def read_root():
    # await addDocument("123","https://www.linkedin.com/pulse/data-structures-powering-our-database-part-1-hash-indexes-prateek/")
    return {"message": f"Hello from FastAPI"}

@router.get("/health")
async def health_check():
    return {"message": f"Health check : OK"}

@router.post('/upload')
async def uploadLink(session_id:str,link:str):
    logger.info(f"Request for uploading a link : {link} , session_id = {session_id}")
    await addDocument(session_id,link)
    logger.info(f"upload link success. session_id = {session_id}")
    return JSONResponse(status_code=200,content={"message":"success"})

@router.post('/upload/confluence')
async def uploadConfluenceLink(session_id:str,link:str,base_url:str,username:str,api_key:str,page_id:str):
    logger.info(f"Request for uploading aconfluence link : {link} , session_id = {session_id}")
    await addConfluenceDocuments(session_id,link,base_url,api_key,username,page_id)
    logger.info(f"upload link success. session_id = {session_id}")
    return JSONResponse(status_code=200,content={"message":"success"})

@router.delete('/reset')
async def reset(session_id:str):
    logger.info(f"resetting session. session_id = {session_id}")
    await resetSession(session_id)

@router.get('/audio')
def getAudioAnswer(question:str,session_id:str):
    # Creating question embedding
    text_response = getAnswerUsingVectorResult(session_id,question)
    print("Got text response")
    audio_stream_response = getAudioForTheText(text_response)
    print("Got audio response")
    return StreamingResponse(audio_stream_response,media_type="audio/wav")

@router.get('/answer')
def getAnswer(question:str,session_id:str):
    # Creating question embedding
    text_response = getAnswerUsingVectorResult(session_id,question)

    confidence_score = getConfidenceScore(session_id,question)
    
    return JSONResponse(status_code=200,content={"message":"OK","data":{
        "answer":text_response,
        "confidence_score":confidence_score
    }})

@router.get('/summarize')
def getAnswer(link:str,session_id:str):
    # Creating question embedding
    logger.info(f"summarizing link {link}. session_id = {session_id}")
    text_response = summarizeLink(session_id,link)
    return JSONResponse(status_code=200,content={"message":"OK","data":{
        "summary":text_response
    }})

'''
Test route for transcribe audio
'''
@router.post("/transcribe")
async def upload_audio(audio: UploadFile = File(...)):
    # audio.filename, audio.content_type available
    # audio_blob = await audio.read() 
     # bytes of the audio file
    audio_bytes = await audio.read()
    file_like = io.BytesIO(audio_bytes)
    response = transcribe(audio_content=file_like)

    return JSONResponse(content={"response":response},status_code=200)


@router.post("/talk")
async def upload_audio(session_id:str,audio: UploadFile = File(...)):
    # audio.filename, audio.content_type available
    # audio_blob = await audio.read() 
     # bytes of the audio file
    audio_bytes = await audio.read()
    file_like = io.BytesIO(audio_bytes)
    question = transcribe(audio_content=file_like)
    text_response = getAnswerUsingVectorResult(session_id,question)
    print("Got text response")
    audio_stream_response = getAudioForTheText(text_response)
    # return JSONResponse(content={"message":textResponse},status_code=200)
    print("Got audio response")
    # return Response(audioResponse, media_type="audio/mpeg")
    return StreamingResponse(audio_stream_response,media_type="audio/wav")
    


# Example route to trigger an error
@router.get("/fail")
async def fail():
    logger.error("Failing")
    raise RuntimeError("Something went wrong!")
