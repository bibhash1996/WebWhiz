# middleware.py
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from logger import request_id_filter

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract or generate request ID
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        
        # Store in the logger's filter
        request_id_filter.request_id = request_id
        
        # Also store in request.state if needed elsewhere
        request.state.request_id = request_id
        
        response = await call_next(request)

        # Add it to response headers
        response.headers["x-request-id"] = request_id

        return response
