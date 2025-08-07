import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";
import { Lancelot } from "next/font/google";

interface Anime {
  nom_anime: string;
  nom_langue: string | null;
  nom_saison: string | null;
  nom_episode: string | null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const anime = searchParams.get("anime");

    if (!anime) {
      return NextResponse.json({ error: "Le paramètre 'anime' est obligatoire." }, { status: 400 });
    }

    const animeDecoded = decodeURIComponent(anime);

    const [rows]: any = await db.query(
        "CALL proc_getAnimeLangues(?)",
        [animeDecoded]
    );

    let langues = rows[0];

    return serveCompressedJSON(langues);

  } catch (error) {
    console.error("Erreur MySQL :", error);
    return NextResponse.json({ error: "Erreur serveur :" + error }, { status: 500 });
  }
}

function serveCompressedJSON(data: Anime) {
  const jsonData = JSON.stringify(data);
  const compressedData = zlib.gzipSync(jsonData);
  return new Response(compressedData, {
    headers: {
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",
    },
  });
}

