# Architecture IA du Chatbot Microtec

## Objectif

Le chatbot a été conçu pour être indépendant du fournisseur IA utilisé.

L'objectif est de pouvoir passer d'Ollama à OpenAI, Claude ou Gemini sans modifier la logique métier du chatbot.

Le changement de fournisseur doit se faire principalement via le fichier `.env`.

---

# Architecture

```text
Frontend
    ↓
FastAPI
    ↓
ChatbotService
    ↓
AIService
    ↓
Provider IA
    ↓
Ollama / OpenAI / Claude / Gemini
```

---

# Principe

Le chatbot ne communique jamais directement avec :

* Ollama
* OpenAI
* Claude
* Gemini

Le chatbot communique uniquement avec :

```python
AIService
```

AIService est responsable de choisir le fournisseur approprié selon la configuration.

---

# Configuration

## config.py

```python
AI_PROVIDER
AI_MODEL
```

### Exemple

```env
AI_PROVIDER=ollama
AI_MODEL=qwen3:8b
```

---

# Fournisseurs supportés

## Ollama

```env
AI_PROVIDER=ollama
AI_MODEL=qwen3:8b
```

Variables utilisées :

```env
OLLAMA_URL=http://localhost:11434
```

---

## OpenAI

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
```

Variables utilisées :

```env
OPENAI_API_KEY=xxxxxxxx
```

---

## Claude (Anthropic)

```env
AI_PROVIDER=anthropic
AI_MODEL=claude-sonnet-4
```

Variables utilisées :

```env
ANTHROPIC_API_KEY=xxxxxxxx
```

---

## Gemini

```env
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash
```

Variables utilisées :

```env
GEMINI_API_KEY=xxxxxxxx
```

---

# Changer de fournisseur

## Situation actuelle

```env
AI_PROVIDER=ollama
AI_MODEL=qwen3:8b
```

## Passer à OpenAI

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini

OPENAI_API_KEY=xxxxxxxx
```

## Passer à Claude

```env
AI_PROVIDER=anthropic
AI_MODEL=claude-sonnet-4

ANTHROPIC_API_KEY=xxxxxxxx
```

## Passer à Gemini

```env
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash

GEMINI_API_KEY=xxxxxxxx
```

Puis redémarrer le backend.

```bash
uvicorn main:app --reload --port 8000
```

---

# Ce qui ne change jamais

Lors d'un changement de fournisseur, aucun changement n'est requis dans :

* ChatbotService
* chat_routes.py
* ConversationService
* EscalationService
* Frontend
* API FastAPI
* Base de connaissances
* Widget de chat

Toute la logique métier demeure identique.

---

# Ajouter un nouveau fournisseur

Créer un nouveau provider :

```text
app/services/providers/
```

Exemple :

```text
xai_provider.py
deepseek_provider.py
mistral_provider.py
```

Ajouter ensuite le provider dans :

```python
AIService
```

Exemple :

```python
providers = {
    "ollama": OllamaProvider,
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    "gemini": GeminiProvider,
    "deepseek": DeepSeekProvider,
}
```

Puis utiliser :

```env
AI_PROVIDER=deepseek
```

---

# Avantages

* Architecture découplée
* Changement rapide de fournisseur
* Maintenance simplifiée
* Évolution facile
* Aucun impact sur le chatbot
* Aucun impact sur le frontend
* Compatible avec n'importe quel LLM futur

---

# Résumé

Le chatbot dépend uniquement de :

```python
AIService
```

AIService décide quel fournisseur utiliser selon :

```env
AI_PROVIDER
```

Le jour où un meilleur modèle apparaît, il suffit :

1. D'ajouter le provider
2. D'ajouter la clé API
3. De modifier AI_PROVIDER dans .env

Aucune autre modification n'est nécessaire.
