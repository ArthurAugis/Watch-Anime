import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

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
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { offset = 0, limit = 100 } = await req.json();
    const userId = session.user.id;

    const [results]: any = await db.query("CALL getallhistory_user(?, ?, ?)", [
      userId,
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
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
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
