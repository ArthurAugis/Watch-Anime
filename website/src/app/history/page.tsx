import HistoriqueClient from "./HistoriqueClient";

export const metadata = {
  title: "Historique de visionnage | Watch-Anime",
  description:
    "Consulte l'historique de tous les animés que tu as regardés sur Watch-Anime. Reprends facilement là où tu t'es arrêté.",
  keywords: [
    "historique animé",
    "animés déjà vus",
    "revoir animé",
    "watch anime historique",
    "continuer animé",
    "suivi visionnage",
    "voir historique streaming",
    "animés regardés récemment",
  ],
};

export default function HomePage() {
  return <HistoriqueClient />;
}
