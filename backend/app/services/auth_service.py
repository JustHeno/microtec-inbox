import json
from pathlib import Path
from datetime import datetime, timedelta

import bcrypt
from jose import jwt, JWTError


class AuthService:
    SECRET_KEY = "CHANGE_ME_SUPER_SECRET_MICROTEC"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS = 12

    def __init__(self):
        self.users_path = Path(__file__).resolve().parents[2] / "data" / "users.json"
        self.users_path.parent.mkdir(parents=True, exist_ok=True)

        if not self.users_path.exists():
            self.users_path.write_text("[]", encoding="utf-8")

    def load_users(self) -> list[dict]:
        content = self.users_path.read_text(encoding="utf-8").strip()
        return json.loads(content) if content else []

    def hash_password(self, password: str) -> str:
        return bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

    def verify_password(self, plain_password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            password_hash.encode("utf-8")
        )

    def authenticate(self, email: str, password: str) -> dict | None:
        for user in self.load_users():
            if user["email"].lower() == email.lower() and user.get("is_active", True):
                if self.verify_password(password, user["password_hash"]):
                    return user
        return None

    def create_access_token(self, user: dict) -> str:
        expire = datetime.utcnow() + timedelta(hours=self.ACCESS_TOKEN_EXPIRE_HOURS)

        payload = {
            "sub": user["email"],
            "name": user["name"],
            "role": user["role"],
            "exp": expire,
        }

        return jwt.encode(payload, self.SECRET_KEY, algorithm=self.ALGORITHM)

    def decode_token(self, token: str) -> dict | None:
        try:
            return jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
        except JWTError:
            return None