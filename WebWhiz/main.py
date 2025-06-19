from fastapi import FastAPI
from app.routes import speak
from app.routes.middleware.errorHandler import ErrorMiddleware
from app.routes.middleware.requestIdHandler import RequestIDMiddleware
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from logger import logger

load_dotenv()

app = FastAPI()

# Allow all origins (you can restrict this in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for specific frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestIDMiddleware)
app.add_middleware(ErrorMiddleware)
app.include_router(speak.router)

if __name__ == "__main__":
    import uvicorn
    logger.info("Server started",extra={"port":8000})
    uvicorn.run(app, host="0.0.0.0", port=8000)
    