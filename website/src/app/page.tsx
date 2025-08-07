import HomeClient from "./HomeClient";

export const metadata = {
  title: "Watch-Anime - Streaming d'animés en VF et VOSTFR",
  description: "Regarde gratuitement les meilleurs animés en streaming HD, VF et VOSTFR. Nouveaux épisodes disponibles chaque jour !",
  keywords: [
    "anime streaming",
    "animé gratuit",
    "VF",
    "VOSTFR",
    "animé HD",
    "regarder animé",
    "anime en ligne",
    "anime vostfr streaming",
  ],
};

export default function HomePage() {
  return <HomeClient />;
}
