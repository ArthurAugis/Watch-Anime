import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";

interface Anime {
  nomAnime: string;
  nomAnimeURL: string;
  afficheAnime: string;
  saisonAnime: string;
  saisonAnimeURL: string;
  episodeAnime: string;
  episodeAnimeURL: string;
  langue: string;
  subnames: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { animeHistory, limit = 100, offset = 0 } = body;

    if (!animeHistory || !Array.isArray(animeHistory)) {
      return NextResponse.json({ message: "Historique manquant ou invalide" }, { status: 400 });
    }

    const decodedHistory = animeHistory.map((entry: any) => {
      if (entry.nom_anime) {
        return {
          ...entry,
          nom_anime: decodeURIComponent(entry.nom_anime),
        };
      }
      return entry;
    });
    const reversedHistory = decodedHistory.reverse();
    const reversedJSON = JSON.stringify(reversedHistory);

    const [results]: any = await db.query("CALL getallhistory(?, ?, ?)", [
      reversedJSON,
      limit,
      offset,
    ]);

    const animeRows = results[0];

    if (!animeRows || animeRows.length === 0) {
      return new Response(null, { status: 204 });
    }

    const animes: Anime[] = animeRows.map((item: any): Anime => ({
      nomAnime: item.nom_anime,
      nomAnimeURL: item.nom_anime_url,
      afficheAnime: item.affiche_url,
      saisonAnime: item.nom_saison,
      saisonAnimeURL: item.nom_saison_url,
      episodeAnime: item.nom_episode,
      episodeAnimeURL: item.nom_episode_url,
      langue: item.nom_langue || "",
      subnames: [],
    }));

    return serveCompressedJSON(animes);
  } catch (error) {
    console.error("❌ Erreur MySQL :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function serveCompressedJSON(data: Anime[]) {
  const jsonData = JSON.stringify(data);
  const compressedData = zlib.gzipSync(jsonData);

  return new Response(compressedData, {
    headers: {
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",
    },
  });
}
