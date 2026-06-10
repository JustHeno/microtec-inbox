import json
import re
import uuid
from pathlib import Path
from datetime import datetime


class ConversationService:
    def __init__(self):
        self.file_path = (
            Path(__file__).resolve().parents[2]
            / "data"
            / "conversations.json"
        )

        self.file_path.parent.mkdir(parents=True, exist_ok=True)

        if not self.file_path.exists():
            self._save([])

    def _load(self) -> list[dict]:
        try:
            content = self.file_path.read_text(encoding="utf-8").strip()
            return json.loads(content) if content else []
        except Exception:
            return []

    def _save(self, conversations: list[dict]) -> None:
        self.file_path.write_text(
            json.dumps(conversations, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def list_conversations(self) -> list[dict]:
        return self._load()

    def get_or_create(self, session_id: str | None = None) -> dict:
        conversations = self._load()

        if session_id:
            for conv in conversations:
                if conv["session_id"] == session_id:
                    self._ensure_defaults(conv)
                    self._save(conversations)
                    return conv

        now = datetime.now().isoformat()

        new_conv = {
            "session_id": session_id or str(uuid.uuid4()),
            "status": "ai_active",
            "priority": "low",
            "reason": None,
            "staff_typing": False,
            "staff_typing_name": None,
            "visitor": {
                "name": None,
                "email": None,
                "phone": None,
            },
            "messages": [],
            "created_at": now,
            "updated_at": now,
        }

        conversations.append(new_conv)
        self._save(conversations)

        return new_conv

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        staff_name: str | None = None,
    ) -> dict:
        conversations = self._load()

        for conv in conversations:
            if conv["session_id"] == session_id:
                self._ensure_defaults(conv)

                message = {
                    "role": role,
                    "content": content,
                    "created_at": datetime.now().isoformat(),
                }

                if role == "staff" and staff_name:
                    message["staff_name"] = staff_name

                conv["messages"].append(message)
                conv["updated_at"] = datetime.now().isoformat()

                self._save(conversations)
                return conv

        conv = self.get_or_create(session_id)

        return self.add_message(
            session_id=conv["session_id"],
            role=role,
            content=content,
            staff_name=staff_name,
        )

    def update_status(
        self,
        session_id: str,
        status: str,
        priority: str | None = None,
        reason: str | None = None,
    ) -> dict:
        conversations = self._load()

        for conv in conversations:
            if conv["session_id"] == session_id:
                self._ensure_defaults(conv)

                conv["status"] = status

                if priority:
                    conv["priority"] = priority

                if reason is not None:
                    conv["reason"] = reason

                conv["updated_at"] = datetime.now().isoformat()

                self._save(conversations)
                return conv

        raise ValueError("Conversation introuvable")

    def set_staff_typing(
        self,
        session_id: str,
        is_typing: bool,
        staff_name: str = "Technicien Microtec",
    ) -> dict:
        conversations = self._load()

        for conv in conversations:
            if conv["session_id"] == session_id:
                self._ensure_defaults(conv)

                conv["staff_typing"] = is_typing
                conv["staff_typing_name"] = staff_name if is_typing else None
                conv["updated_at"] = datetime.now().isoformat()

                self._save(conversations)
                return conv

        raise ValueError("Conversation introuvable")

    def update_visitor_info(
        self,
        session_id: str,
        name: str | None = None,
        email: str | None = None,
        phone: str | None = None,
    ) -> dict:
        conversations = self._load()

        for conv in conversations:
            if conv["session_id"] == session_id:
                self._ensure_defaults(conv)

                if name:
                    conv["visitor"]["name"] = name

                if email:
                    conv["visitor"]["email"] = email

                if phone:
                    conv["visitor"]["phone"] = phone

                conv["updated_at"] = datetime.now().isoformat()

                self._save(conversations)
                return conv

        raise ValueError("Conversation introuvable")

    def extract_and_save_contact_info(self, session_id: str, message: str) -> dict:
        return self.update_visitor_info(
            session_id=session_id,
            name=self._extract_name(message),
            email=self._extract_email(message),
            phone=self._extract_phone(message),
        )

    def reply_staff(
        self,
        session_id: str,
        message: str,
        staff_name: str = "Technicien Microtec",
    ) -> dict:
        self.add_message(
            session_id=session_id,
            role="staff",
            content=message,
            staff_name=staff_name,
        )

        self.set_staff_typing(
            session_id=session_id,
            is_typing=False,
            staff_name=staff_name,
        )

        self.update_status(
            session_id=session_id,
            status="human_active",
        )

        return self.get_or_create(session_id)

    def _ensure_defaults(self, conv: dict) -> None:
        conv.setdefault("staff_typing", False)
        conv.setdefault("staff_typing_name", None)

        if "visitor" not in conv:
            conv["visitor"] = {
                "name": None,
                "email": None,
                "phone": None,
            }

        conv["visitor"].setdefault("name", None)
        conv["visitor"].setdefault("email", None)
        conv["visitor"].setdefault("phone", None)

    def _extract_email(self, text: str) -> str | None:
        match = re.search(
            r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
            text,
        )
        return match.group(0) if match else None

    def _extract_phone(self, text: str) -> str | None:
        match = re.search(
            r"(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}",
            text,
        )
        return match.group(0) if match else None

    def _extract_name(self, text: str) -> str | None:
        patterns = [
            r"je m'appelle\s+([A-Za-zÀ-ÿ' -]{2,60})",
            r"mon nom est\s+([A-Za-zÀ-ÿ' -]{2,60})",
            r"moi c'est\s+([A-Za-zÀ-ÿ' -]{2,60})",
            r"c'est\s+([A-Za-zÀ-ÿ' -]{2,60})",
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)

            if match:
                return match.group(1).strip().title()

        return None