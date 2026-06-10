from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    message: str
    page_url: Optional[str] = None
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    status: str
    needs_human: bool = False