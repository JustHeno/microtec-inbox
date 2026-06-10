from app.core.config import AI_PROVIDER

from app.services.providers.ollama_provider import OllamaProvider
from app.services.providers.openai_provider import OpenAIProvider
from app.services.providers.anthropic_provider import AnthropicProvider
from app.services.providers.gemini_provider import GeminiProvider


class AIService:
    def __init__(self):
        providers = {
            "ollama": OllamaProvider,
            "openai": OpenAIProvider,
            "anthropic": AnthropicProvider,
            "claude": AnthropicProvider,
            "gemini": GeminiProvider,
            "google": GeminiProvider,
        }

        provider_class = providers.get(AI_PROVIDER)

        if not provider_class:
            raise ValueError(
                f"AI_PROVIDER invalide: {AI_PROVIDER}. "
                f"Options: {', '.join(providers.keys())}"
            )

        self.provider = provider_class()

    def generate(self, prompt: str) -> str:
        return self.provider.generate(prompt)