import requests

from app.core.config import GEMINI_API_KEY, AI_MODEL


class GeminiProvider:
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.model = AI_MODEL

    def generate(self, prompt: str) -> str:
        if not self.api_key:
            return "Gemini n’est pas configuré. Ajoutez GEMINI_API_KEY dans le fichier .env."

        try:
            url = (
                f"https://generativelanguage.googleapis.com/v1beta/"
                f"models/{self.model}:generateContent?key={self.api_key}"
            )

            response = requests.post(
                url,
                headers={
                    "Content-Type": "application/json",
                },
                json={
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": prompt,
                                }
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.4,
                        "maxOutputTokens": 300,
                    },
                },
                timeout=45,
            )

            response.raise_for_status()
            data = response.json()

            return data["candidates"][0]["content"]["parts"][0]["text"].strip()

        except Exception as e:
            print(f"[GEMINI ERROR] {e}")
            return "Une erreur est survenue avec Gemini."