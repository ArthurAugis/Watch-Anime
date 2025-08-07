import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Paramètres du compte | Watch-Anime",
  description:
    "Gère tes préférences de compte sur Watch-Anime",
  keywords: [
    "paramètres compte",
    "préférences utilisateur",
    "watch anime compte",
    "modifier profil",
    "gestion compte",
    "confidentialité animé",
    "notifications animés",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function HomePage() {
  return <SettingsClient />;
}
