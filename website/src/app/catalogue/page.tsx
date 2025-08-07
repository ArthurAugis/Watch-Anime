import CatalogueClient from "./CatalogueClient"

export const metadata = {
  title: "Catalogue | Watch-Anime",
  description:
    "Explore le catalogue complet d’animés sur Watch-Anime. Recherche par genre, popularité, saison ou date de sortie. Disponible en VF et VOSTFR.",
  keywords: [
    "catalogue animé",
    "liste animés",
    "animé streaming",
    "animé vf vostfr",
    "regarder animé",
    "animé par genre",
    "nouveaux animés",
    "watch anime catalogue",
  ],
};

export default function Catalogue() {
  return <CatalogueClient />;
}
