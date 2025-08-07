import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";

interface Anime {
  nom_anime: string;
  nom_langue: string | null;
  nom_saison: string | null;
  nom_episode: string | null;
  nom_lecteur: string | null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const anime = searchParams.get("anime");
    let langue = searchParams.get("langue");
    let saison = searchParams.get("saison");
    let episode = searchParams.get("episode");
    let lecteur = searchParams.get("lecteur");

    if (!anime) {
      return NextResponse.json({ error: "Le paramètre 'anime' est obligatoire." }, { status: 400 });
    }

    const animeDecoded = decodeURIComponent(anime);
    let langueDecoded = langue ? decodeURIComponent(langue) : null;
    let saisonDecoded = saison ? decodeURIComponent(saison) : null;
    let episodeDecoded = episode ? decodeURIComponent(episode) : null;
    let lecteurDecoded = lecteur ? decodeURIComponent(lecteur) : null;

    if (saisonDecoded && !langueDecoded) {
      return NextResponse.json({ error: "Si 'saison' est spécifié, 'langue' est obligatoire." }, { status: 400 });
    }

    if (episodeDecoded && (!langueDecoded || !saisonDecoded)) {
      return NextResponse.json({ error: "Si 'episode' est spécifié, 'langue' et 'saison' sont obligatoires." }, { status: 400 });
    }

    if(!langueDecoded) {
        const [rows]: any = await db.query("CALL proc_getAnimeLangueDefault(?)", [animeDecoded]);
        langueDecoded = rows[0]?.[0].anime_langue;
    }

    if(!saisonDecoded) {
        const [rows]: any = await db.query("CALL proc_getAnimeSaisonDefault(?, ?)", [animeDecoded, langueDecoded]);
        saisonDecoded = rows[0]?.[0].saison_nom_url;
    }

    if(!episodeDecoded) {
        const [rows]: any = await db.query("CALL proc_getAnimeEpisodeDefault(?, ?, ?)", [animeDecoded, langueDecoded, saisonDecoded]);
        episodeDecoded = rows[0]?.[0].episode_nom_url;
    }

    if(!lecteurDecoded) {
        const [rows]: any = await db.query("CALL proc_getAnimeLecteurDefault(?, ?, ?, ?)", [animeDecoded, langueDecoded, saisonDecoded, episodeDecoded]);
        lecteurDecoded = rows[0]?.[0].lecteur_nom_url;
    }

    const animeData: Anime = {
        nom_anime: animeDecoded,
        nom_langue: langueDecoded,
        nom_saison: saisonDecoded,
        nom_episode: episodeDecoded,
        nom_lecteur: lecteurDecoded,
      };

    return serveCompressedJSON(animeData);

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

