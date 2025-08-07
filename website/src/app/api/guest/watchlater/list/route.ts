import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";

interface Anime {
  nomAnime: string;
  nomAnimeURL: string;
  afficheAnime: string;
  categorieAnime: string | null;
  langueAnime: string | null;
  subnameAnime: string | null;
  saisonsAnime: number | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { watchLater, limit = 100, offset = 0 } = body;

    if (!watchLater || !Array.isArray(watchLater)) {
      return NextResponse.json({ message: "Paramètre watchLater manquant ou invalide" }, { status: 400 });
    }

    const decodedWatchLater = watchLater.map((name: string) => decodeURIComponent(name));
    const jsonString = JSON.stringify(decodedWatchLater);

    const [results]: any = await db.query("CALL getwatchlaters(?, ?, ?)", [
      jsonString,
      offset,
      limit,
    ]);

    const animeRows = results[0];

    if (!animeRows || animeRows.length === 0) {
      return new Response(null, { status: 204 });
    }

    const animes: Anime[] = animeRows.map((item: any): Anime => ({
      nomAnime: item.nom_anime,
      nomAnimeURL: item.nom_url,
      afficheAnime: item.affiche_anime,
      categorieAnime: item.categorie_anime,
      langueAnime: item.langue_anime,
      subnameAnime: item.subname_anime,
      saisonsAnime: item.saisons_anime,
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
