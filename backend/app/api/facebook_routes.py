from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import PlainTextResponse

from app.core.config import FACEBOOK_VERIFY_TOKEN
from app.services.conversation_service import ConversationService

router = APIRouter(prefix="/webhooks", tags=["Facebook"])

conversation_service = ConversationService()


@router.get("/facebook")
def verify_facebook_webhook(
    hub_mode: str | None = None,
    hub_verify_token: str | None = None,
    hub_challenge: str | None = None,
):
    if hub_mode == "subscribe" and hub_verify_token == FACEBOOK_VERIFY_TOKEN:
        return PlainTextResponse(content=hub_challenge or "")

    raise HTTPException(status_code=403, detail="Token de vérification invalide")


@router.post("/facebook")
async def receive_facebook_message(request: Request):
    data = await request.json()

    for entry in data.get("entry", []):
        for event in entry.get("messaging", []):
            sender_id = event.get("sender", {}).get("id")
            message_text = event.get("message", {}).get("text")

            if not sender_id or not message_text:
                continue

            session_id = f"facebook_{sender_id}"

            conversation = conversation_service.get_or_create(
                session_id=session_id,
                source="facebook",
                external_id=sender_id,
                customer_name="Client Facebook",
            )

            conversation_service.add_message(
                session_id=conversation["session_id"],
                role="user",
                content=message_text,
            )

            conversation_service.update_status(
                session_id=conversation["session_id"],
                status="waiting_human",
                priority="medium",
                reason="facebook_message",
            )

    return {"status": "ok"}