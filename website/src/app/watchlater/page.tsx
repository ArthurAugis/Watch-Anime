import WatchLaterClient from "./WatchLaterClient";

export const metadata = {
  title: "À regarder plus tard | Watch-Anime",
  description:
    "Retrouve tous les animés que tu as ajoutés à ta liste 'à regarder plus tard'. Gère ta watchlist personnelle sur Watch-Anime.",
  keywords: [
    "à regarder plus tard animé",
    "watchlist anime",
    "liste d'attente animés",
    "animé favori",
    "regarder plus tard",
    "watch anime favoris",
    "sauvegarde animés",
    "liste animé personnelle",
  ],
};

export default function HomePage() {
  return <WatchLaterClient />;
}
