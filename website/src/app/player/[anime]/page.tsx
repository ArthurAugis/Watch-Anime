"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";

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
  const { anime } = params as { anime: string };

  const [animeData, setAnimeData] = useState<Anime | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [defaultFetched, setDefaultFetched] = useState(false);
  const [checkedNotFound, setCheckedNotFound] = useState(false);

  const user = session?.user as ExtendedUser;

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        if (user?.id) {
          const response = await fetch(`/api/user/history/lastview?anime=${anime}`);
          const data = await response.json();
          if (data && data.nom_anime) {
            setAnimeData(data);
          }
        } else {
          const storedHistory = Cookies.get("animeHistory");

          if (storedHistory) {
            const history: Anime[] = JSON.parse(storedHistory);
            history.reverse();
            const historyAnime = history.find((item) => item.nom_anime === anime) || null;

            if (historyAnime) {
              setAnimeData(historyAnime);
            }
          }
        }
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
          const response = await fetch(`/api/anime/default?anime=${anime}`);
          const data = await response.json();

          if (data && data.nom_anime) {
            setAnimeData(data);
          }
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
      }
    }
  }, [animeData, router]);

  useEffect(() => {
    if (!animeData && defaultFetched && !checkedNotFound) {
      setCheckedNotFound(true);
      router.replace("/");
    }
  }, [animeData, defaultFetched, checkedNotFound, router]);

  return null;
}
