from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.services.conversation_service import ConversationService


router = APIRouter(prefix="/contact", tags=["contact"])

conversation_service = ConversationService()


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    phone: str | None = None


@router.post("/shopify")
def receive_shopify_contact(payload: ContactRequest):
    try:
        if not payload.name.strip():
            raise HTTPException(status_code=400, detail="Nom obligatoire")

        if not payload.subject.strip():
            raise HTTPException(status_code=400, detail="Sujet obligatoire")

        if not payload.message.strip():
            raise HTTPException(status_code=400, detail="Message obligatoire")

        conversation = conversation_service.create_from_contact_form(
            name=payload.name,
            email=str(payload.email),
            phone=payload.phone,
            subject=payload.subject,
            message=payload.message,
            source="shopify_contact",
        )

        return {
            "success": True,
            "conversation": conversation,
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Impossible de créer la conversation depuis le formulaire",
        )