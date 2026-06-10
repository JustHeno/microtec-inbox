import requests

from app.core.config import (
    OLLAMA_URL,
    AI_MODEL,
)


class OllamaService:
    def __init__(self):
        self.base_url = OLLAMA_URL
        self.model = AI_MODEL

    def generate(self, prompt: str) -> str:
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.4,
                        "top_p": 0.9,
                        "repeat_penalty": 1.1,
                        "num_predict": 180,
                    },
                },
                timeout=45,
            )

            response.raise_for_status()
            data = response.json()

            return (
                data.get("response")
                or "Je suis désolé, je n'ai pas pu générer une réponse."
            ).strip()

        except requests.exceptions.Timeout:
            return "La réponse prend plus de temps que prévu. Pouvez-vous reformuler votre question?"

        except requests.exceptions.ConnectionError:
            return "Impossible de communiquer avec le moteur IA local."

        except Exception as e:
            print(f"[OLLAMA ERROR] {e}")
            return "Une erreur est survenue lors du traitement de votre demande."