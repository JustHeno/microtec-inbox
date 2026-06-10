from fastapi import APIRouter, HTTPException

from app.models.chat_models import ChatRequest, ChatResponse
from app.services.chatbot_service import ChatbotService
from app.services.conversation_service import ConversationService
from app.services.escalation_service import EscalationService

router = APIRouter(prefix="/api", tags=["Chatbot"])

chatbot_service = ChatbotService()
conversation_service = ConversationService()
escalation_service = EscalationService()


HUMAN_ACCEPTANCE_KEYWORDS = [
    "oui",
    "oui svp",
    "oui s'il vous plaît",
    "oui s'il vous plait",
    "oui je veux",
    "oui j'aimerais",
    "oui jaimerais",
    "parler à quelqu'un",
    "parler a quelqu'un",
    "parler à un humain",
    "parler a un humain",
    "technicien",
    "conseiller",
    "vendeur",
    "humain",
]


def user_accepts_human_transfer(message: str) -> bool:
    text = message.lower().strip()
    return any(keyword in text for keyword in HUMAN_ACCEPTANCE_KEYWORDS)


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    conversation = conversation_service.get_or_create(request.session_id)
    session_id = conversation["session_id"]

    conversation_service.add_message(
        session_id=session_id,
        role="user",
        content=request.message,
    )

    current_status = conversation.get("status", "ai_active")

    if current_status == "human_active":
        conversation_service.extract_and_save_contact_info(
            session_id=session_id,
            message=request.message,
        )

        return ChatResponse(
            reply="",
            session_id=session_id,
            status="human_active",
            needs_human=True,
        )

    if current_status == "closed":
        return ChatResponse(
            reply=(
                "Cette discussion est fermée. "
                "Vous pouvez démarrer une nouvelle conversation si vous avez besoin d’aide."
            ),
            session_id=session_id,
            status="closed",
            needs_human=False,
        )

    if current_status == "waiting_human":
        conversation_service.extract_and_save_contact_info(
            session_id=session_id,
            message=request.message,
        )

        reply = chatbot_service.answer(
            message=request.message,
            page_url=request.page_url,
        )

        conversation_service.add_message(
            session_id=session_id,
            role="assistant",
            content=reply,
        )

        return ChatResponse(
            reply=reply,
            session_id=session_id,
            status="waiting_human",
            needs_human=True,
        )

    if user_accepts_human_transfer(request.message):
        conversation = conversation_service.update_status(
            session_id=session_id,
            status="waiting_human",
            priority="medium",
            reason="human_requested",
        )

        reply = (
            "Parfait 👍 Nous avons avisé un membre de notre équipe.\n\n"
            "En attendant, je peux continuer à vous aider ici et transmettre toutes les informations "
            "au conseiller qui prendra la discussion.\n\n"
            "Pour qu’on puisse vous rejoindre si personne n’est disponible immédiatement, "
            "pouvez-vous me laisser votre prénom, nom, numéro de téléphone ou courriel?"
        )

        conversation_service.add_message(
            session_id=session_id,
            role="assistant",
            content=reply,
        )

        return ChatResponse(
            reply=reply,
            session_id=session_id,
            status=conversation.get("status", "waiting_human"),
            needs_human=True,
        )

    reply = chatbot_service.answer(
        message=request.message,
        page_url=request.page_url,
    )

    escalation = escalation_service.analyze(request.message)

    if escalation["needs_human"]:
        conversation = conversation_service.update_status(
            session_id=session_id,
            status="waiting_human",
            priority=escalation["priority"],
            reason=escalation["reason"],
        )

        reply += (
            "\n\nUn membre de notre équipe pourrait aussi vous aider directement avec ça. "
            "Voulez-vous qu’on prenne le relais?\n\n"
            "Si oui, vous pourrez aussi nous laisser votre prénom, nom, téléphone ou courriel "
            "pour qu’on puisse vous rejoindre au besoin."
        )
    else:
        conversation = conversation_service.get_or_create(session_id)

    conversation_service.add_message(
        session_id=session_id,
        role="assistant",
        content=reply,
    )

    return ChatResponse(
        reply=reply,
        session_id=session_id,
        status=conversation.get("status", "ai_active"),
        needs_human=escalation["needs_human"],
    )


@router.get("/conversations/{session_id}")
def get_conversation(session_id: str):
    conversation = conversation_service.get_or_create(session_id)

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation introuvable")

    return conversation