"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Anime {
  nom_anime: string;
  nom_langue: string;
  nom_saison: string;
  nom_episode: string;
  nom_lecteur?: string;
}

export default function PlayerRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const { anime, lang, season, episode } = params as {
    anime: string;
    lang: string;
    season: string;
    episode: string;
  };

  const [animeData, setAnimeData] = useState<Anime | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDefaultAnime = async () => {
      try {
        const response = await fetch(
          `/api/anime/default?anime=${anime}&langue=${lang}&saison=${season}&episode=${episode}`
        );
        const data = await response.json();
        setAnimeData(data);
      } catch (err: any) {
        setError("Impossible de récupérer l'anime : " + err.message);
      }
    };
    fetchDefaultAnime();
  }, [anime, lang, season, episode]);

  useEffect(() => {
    if (animeData) {
      const { nom_anime, nom_langue, nom_saison, nom_episode, nom_lecteur } = animeData;
      if (nom_anime && nom_langue && nom_saison && nom_episode && nom_lecteur) {
        router.replace(`/player/${nom_anime}/${nom_langue}/${nom_saison}/${nom_episode}/Lecteur-${nom_lecteur}`);
      }
    }
  }, [animeData, router]);

  if (error) return <p className="text-red-500">{error}</p>;

  return null;
}
