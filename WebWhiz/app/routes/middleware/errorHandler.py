from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import traceback
from logger import logger

# Custom error middleware
class ErrorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            # Optional: log the full stack trace
            # print(traceback.format_exc())
            logger.error("Error in request : ", extra={"traceback" : traceback.format_exc()})

            return JSONResponse(
                status_code=500,
                content={"error": "Internal Server Error", "detail": str(e)},
            )
