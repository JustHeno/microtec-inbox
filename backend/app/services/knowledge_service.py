from pathlib import Path


class KnowledgeService:
    def __init__(self):
        self.base_path = Path(__file__).resolve().parents[2] / "knowledge"

    def load_file(self, filename: str) -> str:
        file_path = self.base_path / filename

        if not file_path.exists():
            return ""

        return file_path.read_text(encoding="utf-8").strip()

    def load_horaire(self) -> str:
        content = self.load_file("horaire.md")

        if not content:
            return (
                "Je n'ai pas accès à l'horaire pour le moment. "
                "Veuillez contacter Microtec directement."
            )

        return content

    def load_adresse(self) -> str:
        content = self.load_file("adresse.md")

        if not content:
            return (
                "Je n'ai pas accès à l'adresse pour le moment. "
                "Veuillez contacter Microtec directement."
            )

        return (
            "Microtec Performance Informatique est situé au :\n\n"
            "2085 Bd Saint-Joseph\n"
            "Drummondville, QC J2B 5L7\n\n"
            "Téléphone : (819) 479-7400"
        )

    def load_coordonnees(self) -> str:
        horaire = self.load_horaire()
        adresse = self.load_adresse()

        content = []

        if horaire:
            content.append(horaire)

        if adresse:
            content.append(adresse)

        if not content:
            return (
                "Je n'ai pas accès aux coordonnées pour le moment. "
                "Veuillez contacter Microtec directement."
            )

        return "\n\n".join(content)

    def load_all(self) -> str:
        if not self.base_path.exists():
            return ""

        content = []

        for file_path in sorted(self.base_path.glob("*.md")):
            file_content = file_path.read_text(encoding="utf-8").strip()

            if file_content:
                content.append(
                    f"===== {file_path.stem.upper()} =====\n\n"
                    f"{file_content}"
                )

        return "\n\n".join(content)