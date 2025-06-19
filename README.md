# WebWhiz

# DEMO


https://github.com/user-attachments/assets/cd3c2312-1cc4-4f3b-8fb0-ba29b34beadb




# 🚩 Problem Statement

Organizations often store vast amounts of internal knowledge across platforms like Confluence, SharePoint, and internal wikis. However, employees face challenges in quickly finding accurate, relevant information. Traditional search is inefficient, context-blind, and time-consuming.

The goal is to build a chatbot assistant that can understand and retrieve information from internal and external knowledge sources, respond to user queries conversationally, and provide citations and confidence scores to ensure trust in the answers.

---

# 💡 Our Solution: WEBWHIZ

We present **WEBWHIZ**, a conversational AI tool that allows users to ask questions about any article, blog, webpage, or internal documentation — and receive contextual, verifiable answers.

---

# 🔧 Core Functionality

- **Link-Based Knowledge Ingestion**:  
  Users provide any public URL (articles, blogs, wikis, etc.) or Confluence page link. WEBWHIZ parses and understands the content behind the link.

- **Conversational Interface**:  
  Users can ask questions through text or audio. The system responds naturally, citing the source and including a confidence score (in %) for each answer.

- **Session-Based Context Management**:  
  Each session is initialized when the user submits a new link. All questions asked within the session are grounded in that specific content.

- **Restricted Content Handling (Confluence)**:  
  For private Confluence pages, the system prompts the user for authentication, retrieves the content securely, and continues the chat as usual.

- **Extensible Architecture**:  
  While we currently support Confluence and public URLs, the architecture is designed to easily incorporate support for SharePoint, internal wikis, or other enterprise sources.

---

# 🧰 Tech Stack

| Component          | Technology/Service                           |
| ------------------ | -------------------------------------------- |
| **Backend**        | Python 3 with FastAPI                        |
| **Frontend**       | ReactJS                                      |
| **LLM**            | GPT-4 (via OpenAI API)                       |
| **Vector Store**   | AstraDB (for content indexing)               |
| **Audio**          | ElevenLabs (speech-to-text & text-to-speech) |
| **Authentication** | OAuth/Manual token (for Confluence access)   |

---

# 🧠 Key Features

- Chat or audio input support
- Confidence score with every response
- Source citations for verification
- Handles private and public content
- Extendable to other enterprise tools
- Modern, responsive UI

# Steps to run backend

`cd WebWhiz`

`python3 -m venv venv`

`source venv/bin/activate`

`pip3 install -r requirements.txt`

`Update the .env file with the appropriate keys`

`python3 main.py`

# Steps to run the UI

`cd UI`

`npm install`

`npm run dev`
