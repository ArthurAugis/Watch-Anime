"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Anime {
  nom_anime: string;
  nom_langue: string;
  nom_saison: string;
  nom_episode: string;
  nom_lecteur?: string;
}

export default function PlayerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { anime, lang } = params as { anime: string; lang: string };

  const [animeData, setAnimeData] = useState<Anime | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDefaultAnime = async () => {
      try {
        const response = await fetch(`/api/anime/default?anime=${anime}&langue=${lang}`);

        const data = await response.json();
        if(data.error) {
          const newUrl = `/player/${anime}`;
          window.location.href = newUrl;
        }

        setAnimeData(data);
      } catch (err: any) {
        setError("Impossible de récupérer l'anime : " + err.message);
      }
    };

    fetchDefaultAnime();
  }, [anime, lang]);

  useEffect(() => {
    if (animeData) {
      const { nom_anime, nom_saison, nom_episode, nom_lecteur } = animeData;
      if (nom_anime && nom_saison && nom_episode && nom_lecteur) {
        router.replace(`/player/${nom_anime}/${lang}/${nom_saison}/${nom_episode}/Lecteur-${nom_lecteur}`);
      } else if (nom_anime && nom_saison && nom_episode) {
        router.replace(`/player/${nom_anime}/${lang}/${nom_saison}/${nom_episode}`);
      }
    }
  }, [animeData, router]);

  if (error) return <p className="text-red-500">{error}</p>;

  return null;
}
