import RecentUpdateClient from "./RecentUpdateClient";

export const metadata = {
  title: "Récemment mis à jour | Watch-Anime",
  description:
    "Découvre les derniers épisodes d’animés ajoutés ou mis à jour sur Watch-Anime. Toujours en VF et VOSTFR, à jour avec les dernières sorties.",
  keywords: [
    "animés récents",
    "nouveaux épisodes animés",
    "mise à jour animés",
    "derniers animés",
    "animé en streaming",
    "anime vostfr récent",
    "watch anime nouvel épisode",
  ],
};


export default function HomePage() {
  return <RecentUpdateClient />;
}
