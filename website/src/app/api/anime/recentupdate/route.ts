import { NextResponse } from "next/server";
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const [results]: any = await db.query("CALL recentupdate(?, ?)", [limit, offset]);
    const animeRows = results[0];

    if (!animeRows || animeRows.length === 0) {
      return new Response(null, { status: 204 });
    }

    const animes: Anime[] = animeRows.map((item: any): Anime => ({
      nomAnime: item.nom_anime,
      nomAnimeURL: item.nom_anime_url,
      afficheAnime: item.affiche,
      saisonAnime: item.nom_saison,
      saisonAnimeURL: item.nom_saison_url,
      episodeAnime: item.nom_episode,
      episodeAnimeURL: item.nom_episode_url,
      langue: item.nom_langue,
      subnames: item.anime_subname ? item.anime_subname.split(",") : [],
    }));

    return serveCompressedJSON(animes);
  } catch (error) {
    console.error("Erreur MySQL :", error);
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
