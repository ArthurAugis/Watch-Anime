import TopAnimesClient from "./TopAnimesClient";

export const metadata = {
  title: "Top Animés | Watch-Anime",
  description:
    "Découvre les animés les plus populaires du moment sur Watch-Anime. Classement basé sur les likes de nos utilisateurs. Disponibles en VF et VOSTFR.",
  keywords: [
    "top animés",
    "animés populaires",
    "classement animés",
    "meilleurs animés",
    "anime tendance",
    "anime le plus regardé",
    "watch anime top",
    "animé à voir",
  ],
};

export default function HomePage() {
  return <TopAnimesClient />;
}
