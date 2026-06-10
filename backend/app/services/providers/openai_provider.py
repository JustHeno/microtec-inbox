import requests

from app.core.config import OPENAI_API_KEY, AI_MODEL


class OpenAIProvider:
    def __init__(self):
        self.api_key = OPENAI_API_KEY
        self.model = AI_MODEL
        self.url = "https://api.openai.com/v1/chat/completions"

    def generate(self, prompt: str) -> str:
        if not self.api_key:
            return "OpenAI n’est pas configuré. Ajoutez OPENAI_API_KEY dans le fichier .env."

        try:
            response = requests.post(
                self.url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    "temperature": 0.4,
                    "max_tokens": 300,
                },
                timeout=45,
            )

            response.raise_for_status()
            data = response.json()

            return data["choices"][0]["message"]["content"].strip()

        except Exception as e:
            print(f"[OPENAI ERROR] {e}")
            return "Une erreur est survenue avec OpenAI."