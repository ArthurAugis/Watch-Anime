import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";

interface Langues {
  nom_langue: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const anime = searchParams.get("anime");
    const season = searchParams.get("season");
    const episode = searchParams.get("episode");

    const animeDecoded = anime ? decodeURIComponent(anime) : null;
    const seasonDecoded = season ? decodeURIComponent(season) : null;
    const episodeDecoded = episode ? decodeURIComponent(episode) : null;

    const [rows]: any = await db.query(
      "CALL proc_getLanguesEpisode(?, ?, ?)",
      [animeDecoded, seasonDecoded, episodeDecoded]
    );

    const rowList = rows?.[0];

    if (!rowList || rowList.length === 0) {
      return new Response(null, { status: 204 });
    }

    const animeData: Langues[] = rowList.map((r: any) => ({
      nom_langue: r.anime_langue,
    }));

    return serveCompressedJSON(animeData);
  } catch (error) {
    console.error("Erreur MySQL :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function serveCompressedJSON(data: Langues[]) {
  const jsonData = JSON.stringify(data);
  const compressedData = zlib.gzipSync(jsonData);

  return new Response(compressedData, {
    headers: {
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",
    },
  });
}
