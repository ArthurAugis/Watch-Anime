"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  admin?: boolean;
}

interface Anime {
  nom_anime: string;
  nom_langue: string;
  nom_saison: string;
  nom_episode: string;
  nom_lecteur?: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { anime, lang, season } = params as {
    anime: string;
    lang: string;
    season: string;
  };

  const [animeData, setAnimeData] = useState<Anime | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [defaultFetched, setDefaultFetched] = useState(false);

  const user = session?.user as ExtendedUser;

  useEffect(() => {
    const fetchAnime = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(
          `/api/user/history/lastview?anime=${anime}&langue=${lang}&saison=${season}`
        );
        const data = await response.json();

        setAnimeData(data);
      } catch (err: any) {
        setError("Impossible de récupérer les informations : " + err.message);
      }
    };

    fetchAnime();
  }, [anime, user?.id]);

  useEffect(() => {
    if (!animeData && !defaultFetched) {
      const fetchDefaultAnime = async () => {
        try {
          const response = await fetch(
            `/api/anime/default?anime=${anime}&langue=${lang}&saison=${season}`
          );
          const data = await response.json();

          setAnimeData(data);
        } catch (err: any) {
          setError("Impossible de récupérer l'anime par défaut : " + err.message);
        } finally {
          setDefaultFetched(true);
        }
      };

      fetchDefaultAnime();
    }
  }, [animeData, defaultFetched, anime]);

  useEffect(() => {
    if (animeData) {
      const { nom_anime, nom_langue, nom_saison, nom_episode, nom_lecteur } = animeData;
      if (nom_anime && nom_langue && nom_saison && nom_episode && nom_lecteur) {
        router.replace(`/player/${nom_anime}/${nom_langue}/${nom_saison}/${nom_episode}/Lecteur-${nom_lecteur}`);
      } else if (nom_anime && nom_langue && nom_saison && nom_episode) {
        router.replace(`/player/${nom_anime}/${nom_langue}/${nom_saison}/${nom_episode}`);
      } else {
        const newUrl = `/player/${anime}/${lang}`;
        window.location.href = newUrl;
      }
    }
  }, [animeData, router]);

  return null;
}
