class EscalationService:
    def analyze(self, message: str) -> dict:
        text = message.lower()

        high_priority_keywords = [
            "liquide",
            "eau",
            "café",
            "cafe",
            "macbook",
            "ne démarre plus",
            "demarre plus",
            "perte de données",
            "perte de donnees",
            "serveur",
            "réseau",
            "reseau",
            "cybersécurité",
            "cybersecurite",
            "piraté",
            "pirate",
            "urgent",
        ]

        sales_keywords = [
            "acheter",
            "achat",
            "prix",
            "combien",
            "soumission",
            "devis",
            "rendez-vous",
            "rdv",
            "portable",
            "ordinateur",
            "pc",
            "setup",
        ]

        human_keywords = [
            "parler à quelqu’un",
            "parler a quelqu'un",
            "technicien",
            "vendeur",
            "humain",
            "appeler",
            "support",
        ]

        if any(keyword in text for keyword in high_priority_keywords):
            return {
                "needs_human": True,
                "reason": "technical_priority",
                "priority": "high",
            }

        if any(keyword in text for keyword in sales_keywords):
            return {
                "needs_human": True,
                "reason": "sales_opportunity",
                "priority": "medium",
            }

        if any(keyword in text for keyword in human_keywords):
            return {
                "needs_human": True,
                "reason": "human_requested",
                "priority": "high",
            }

        return {
            "needs_human": False,
            "reason": None,
            "priority": "low",
        }