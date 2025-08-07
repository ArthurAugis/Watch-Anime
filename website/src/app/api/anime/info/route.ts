import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";

interface Anime {
  url_video: string;
  nom_anime: string;
  description_anime: string;
  nom_langue: string;
  nom_saison: string;
  nom_episode: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const anime = searchParams.get("anime");
    const lang = searchParams.get("lang");
    const season = searchParams.get("season");
    const episode = searchParams.get("episode");
    const lecteur = searchParams.get("lecteur");

    if (!anime || !lang || !season || !episode || !lecteur) {
      return NextResponse.json(
        { error: "Missing required query parameters: anime, lang, season, episode" },
        { status: 400 }
      );
    }

    const animeDecoded = decodeURIComponent(anime);
    const langDecoded = decodeURIComponent(lang);
    const seasonDecoded = decodeURIComponent(season);
    const episodeDecoded = decodeURIComponent(episode);
    const lecteurDecode = decodeURIComponent(lecteur);

    const [rows]: any = await db.query(
      "CALL proc_getInfoLecteur(?, ?, ?, ?, ?)",
      [animeDecoded, langDecoded, seasonDecoded, episodeDecoded, lecteurDecode]
    );

    const row = rows[0]?.[0];

    if (!row) {
      return NextResponse.json(
        {
          message: "No information found",
          received: {
            anime,
            lang,
            season,
            episode,
          },
        },
        { status: 404 }
      );
    }
    

    const animeData: Anime = {
      url_video: row.url_video,
      nom_anime: row.nom_anime,
      description_anime: row.description_anime,
      nom_langue: row.nom_langue,
      nom_saison: row.nom_saison,
      nom_episode: row.nom_episode,
    };

    return serveCompressedJSON(animeData);
  } catch (error) {
    console.error("Erreur MySQL :", error);
    return NextResponse.json({ error: "Erreur serveur : " + error }, { status: 500 });
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
