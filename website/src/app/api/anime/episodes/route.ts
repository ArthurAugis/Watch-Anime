import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";

interface Episodes {
  nom_episode: string;
  num_episode: number;
  nom_episode_url: string;
  url_video: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const anime = searchParams.get("anime");
    const langue = searchParams.get("langue");
    const season = searchParams.get("season");

    const animeDecoded = anime ? decodeURIComponent(anime) : null;
    const langueDecoded = langue ? decodeURIComponent(langue) : null;
    const seasonDecoded = season ? decodeURIComponent(season) : null;

    const [rows]: any = await db.query(
      "CALL proc_getAnimeEpisodes(?, ?, ?)",
      [animeDecoded, langueDecoded, seasonDecoded]
    );

    const rowList = rows?.[0];

    if (!rowList || rowList.length === 0) {
      return new Response(null, { status: 204 });
    }

    const episodesData: Episodes[] = rowList.map((r: any) => ({
      nom_episode: r.episode_nom,
      num_episode: r.episode_num,
      nom_episode_url: r.episode_nom_url,
      url_video: r.episode_url,
    }));

    return serveCompressedJSON(episodesData);
  } catch (error) {
    console.error("Erreur MySQL :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function serveCompressedJSON(data: Episodes[]) {
  const jsonData = JSON.stringify(data);
  const compressedData = zlib.gzipSync(jsonData);

  return new Response(compressedData, {
    headers: {
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",
    },
  });
}
