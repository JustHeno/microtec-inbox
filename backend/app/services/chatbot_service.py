from app.services.ai_service import AIService
from app.services.knowledge_service import KnowledgeService
from app.services.escalation_service import EscalationService


class ChatbotService:
    def __init__(self):
        self.ai = AIService()
        self.knowledge = KnowledgeService()
        self.escalation = EscalationService()

    def answer(
        self,
        message: str,
        page_url: str | None = None,
    ) -> str:
        message_lower = message.lower().strip()

        small_talk_response = self._handle_small_talk(message_lower)
        if small_talk_response:
            return small_talk_response

        if any(keyword in message_lower for keyword in self._adresse_keywords()):
            return self.knowledge.load_adresse()

        if any(keyword in message_lower for keyword in self._horaire_keywords()):
            return self.knowledge.load_coordonnees()

        if any(keyword in message_lower for keyword in self._contact_keywords()):
            return self.knowledge.load_coordonnees()

        page_context = self._get_page_context(page_url)
        knowledge_context = self.knowledge.load_all()

        prompt = f"""
Tu es Microtec Assistant, l’assistant conversationnel de Microtec Performance Informatique.

Tu es un conseiller informatique humain, naturel, sympathique, rapide et utile.

==================================================
STYLE
==================================================

- Français québécois naturel.
- Réponse courte : 2 à 5 phrases.
- Ton conversationnel.
- Pas de rapport technique.
- Pas de gros bloc.
- Une seule question à la fin si nécessaire.
- Ne saute pas trop vite vers un humain.
- Qualifie le besoin avant de proposer un transfert.
- Réponds comme quelqu’un au comptoir ou au téléphone.

==================================================
EXPERTISE
==================================================

Tu comprends très bien :

- Ordinateurs Windows
- MacBook et produits Apple
- Portables
- Tours gaming
- Composantes informatiques
- Réseautique
- Wi-Fi
- Imprimantes
- Virus et sécurité
- Microsoft 365
- Sauvegardes
- Récupération de données
- Services TI pour entreprises
- Cybersécurité
- Achat d’équipement

==================================================
RÈGLES MICROTEC
==================================================

Tu ne dois jamais inventer :

- Prix
- Inventaire
- Disponibilité
- Promotion
- Garantie
- Politique de retour
- Délai précis
- Procédure interne
- Décision finale de réparation

Si le client demande un prix, un tarif ou une disponibilité :
Explique que ça dépend du besoin, pose une question simple, puis indique qu’un conseiller pourra confirmer.

==================================================
COMPORTEMENT
==================================================

Si le client pose une question vague :
Pose une question de clarification.

Si le client décrit un problème technique :
Explique simplement la cause probable et pose une question utile.

Si le client veut acheter :
Demande l’usage, le budget ou le type d’appareil.

Si le client parle cybersécurité :
Réponds avec assurance, mais simplement.

==================================================
CONNAISSANCES MICROTEC
==================================================

{knowledge_context}

==================================================
CONTEXTE DE LA PAGE
==================================================

{page_context}

==================================================
MESSAGE CLIENT
==================================================

{message}

Réponse courte, naturelle et conversationnelle :
"""

        response = self.ai.generate(prompt)
        response = self._clean_response(response)

        escalation = self.escalation.analyze(message)

        if escalation.get("needs_human"):
            response += "\n\nUn conseiller pourra confirmer les détails avec vous au besoin."

        return response

    def _handle_small_talk(self, message_lower: str) -> str | None:
        greetings = [
            "bonjour",
            "bonjours",
            "salut",
            "allo",
            "hello",
            "hey",
            "yo",
            "bon matin",
            "bonsoir",
        ]

        thanks = [
            "merci",
            "merci beaucoup",
            "parfait merci",
            "super merci",
            "thanks",
        ]

        positive = [
            "ok",
            "okay",
            "parfait",
            "super",
            "good",
            "nice",
            "daccord",
            "d'accord",
            "c'est bon",
            "cest bon",
        ]

        if message_lower in greetings:
            return "Bonjour! Comment je peux vous aider aujourd’hui?"

        if message_lower in thanks:
            return "Ça fait plaisir! Est-ce que je peux vous aider avec autre chose?"

        if message_lower in positive:
            return "Parfait 👍 Dites-moi ce que vous aimeriez faire ensuite."

        return None

    def _clean_response(self, response: str) -> str:
        if not response:
            return "Je suis désolé, je n’ai pas réussi à générer une réponse."

        response = response.strip()

        unwanted_prefixes = [
            "RÉPONSE DE MICROTEC :",
            "Réponse de Microtec :",
            "Microtec Assistant :",
            "Assistant :",
            "Microtec:",
            "Microtec :",
            "Réponse courte, naturelle et conversationnelle :",
        ]

        for prefix in unwanted_prefixes:
            if response.startswith(prefix):
                response = response.replace(prefix, "", 1).strip()

        return response

    def _get_page_context(self, page_url: str | None) -> str:
        if not page_url:
            return "Aucune information sur la page actuelle."

        url = page_url.lower()

        if "ordinateur" in url:
            return "Le client consulte une page reliée aux ordinateurs."

        if "portable" in url or "laptop" in url:
            return "Le client consulte une page reliée aux ordinateurs portables."

        if "macbook" in url or "apple" in url or "mac" in url:
            return "Le client consulte une page reliée aux produits Apple ou MacBook."

        if "gaming" in url:
            return "Le client consulte une page gaming."

        if "serveur" in url:
            return "Le client consulte une page reliée aux serveurs."

        if "cyber" in url or "securite" in url or "sécurité" in url:
            return "Le client consulte une page reliée à la cybersécurité."

        if "reparation" in url or "réparation" in url:
            return "Le client consulte une page de réparation."

        if "entreprise" in url or "business" in url:
            return "Le client consulte une page destinée aux entreprises."

        return f"Le client consulte actuellement : {page_url}"

    def _adresse_keywords(self) -> list[str]:
        return [
            "adresse",
            "où êtes-vous",
            "ou etes-vous",
            "où êtes vous",
            "ou etes vous",
            "où se trouve",
            "ou se trouve",
            "où est",
            "ou est",
            "localisation",
            "emplacement",
            "situé",
            "situe",
            "place",
            "boutique",
            "magasin",
        ]

    def _horaire_keywords(self) -> list[str]:
        return [
            "horaire",
            "ouvert",
            "ouverte",
            "ouvrez",
            "ouverture",
            "fermé",
            "fermée",
            "fermee",
            "fermeture",
            "heure",
            "heures",
            "aujourd'hui",
            "aujourdhui",
        ]

    def _contact_keywords(self) -> list[str]:
        return [
            "telephone",
            "téléphone",
            "numero",
            "numéro",
            "contact",
            "appeler",
            "courriel",
            "email",
            "joindre",
        ]