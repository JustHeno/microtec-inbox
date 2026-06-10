from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.services.conversation_service import ConversationService
from app.core.security import require_staff

router = APIRouter(
    prefix="/staff",
    tags=["Staff"],
    dependencies=[Depends(require_staff)],
)

conversation_service = ConversationService()


class StaffReplyRequest(BaseModel):
    message: str


class StaffTypingRequest(BaseModel):
    is_typing: bool


@router.get("/conversations")
def list_conversations():
    return conversation_service.list_conversations()


@router.post("/conversations/{session_id}/take")
def take_conversation(session_id: str):
    try:
        return conversation_service.update_status(
            session_id=session_id,
            status="human_active",
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Conversation introuvable")


@router.post("/conversations/{session_id}/reply")
def reply_conversation(
    session_id: str,
    payload: StaffReplyRequest,
    current_user: dict = Depends(require_staff),
):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message vide")

    staff_name = current_user.get("name") or "Technicien Microtec"

    try:
        return conversation_service.reply_staff(
            session_id=session_id,
            message=payload.message.strip(),
            staff_name=staff_name,
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Conversation introuvable")


@router.post("/conversations/{session_id}/typing")
def set_typing(
    session_id: str,
    payload: StaffTypingRequest,
    current_user: dict = Depends(require_staff),
):
    staff_name = current_user.get("name") or "Technicien Microtec"

    try:
        return conversation_service.set_staff_typing(
            session_id=session_id,
            is_typing=payload.is_typing,
            staff_name=staff_name,
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Conversation introuvable")


@router.post("/conversations/{session_id}/close")
def close_conversation(session_id: str):
    try:
        conversation_service.set_staff_typing(
            session_id=session_id,
            is_typing=False,
        )

        return conversation_service.update_status(
            session_id=session_id,
            status="closed",
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Conversation introuvable")