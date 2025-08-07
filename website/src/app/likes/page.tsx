import LikesClient from "./LikesClient";

export const metadata = {
  title: "Mes animés likés | Watch-Anime",
  description:
    "Retrouve tous les animés que tu as likés sur Watch-Anime. Une liste personnalisée de tes animés préférés, en VF et VOSTFR.",
  keywords: [
    "animés likés",
    "favoris animés",
    "mes animés préférés",
    "like animé",
    "watch anime favoris",
    "liste animés aimés",
    "animé en streaming",
    "anime préféré watch anime",
  ],
};

export default function HomePage() {
  return <LikesClient />;
}
