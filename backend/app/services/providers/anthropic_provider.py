import requests

from app.core.config import ANTHROPIC_API_KEY, AI_MODEL


class AnthropicProvider:
    def __init__(self):
        self.api_key = ANTHROPIC_API_KEY
        self.model = AI_MODEL
        self.url = "https://api.anthropic.com/v1/messages"

    def generate(self, prompt: str) -> str:
        if not self.api_key:
            return "Claude n’est pas configuré. Ajoutez ANTHROPIC_API_KEY dans le fichier .env."

        try:
            response = requests.post(
                self.url,
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "max_tokens": 300,
                    "temperature": 0.4,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                },
                timeout=45,
            )

            response.raise_for_status()
            data = response.json()

            return data["content"][0]["text"].strip()

        except Exception as e:
            print(f"[ANTHROPIC ERROR] {e}")
            return "Une erreur est survenue avec Claude."