import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

interface Anime {
  nom_anime: string;
  nom_langue: string;
  nom_saison: string;
  nom_episode: string;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const anime = searchParams.get("anime");
    const langue = searchParams.get("langue");
    const saison = searchParams.get("saison");

    if (!anime) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const animeDecoded = decodeURIComponent(anime);
    const langueDecoded = langue ? decodeURIComponent(langue) : null;
    const saisonDecoded = saison ? decodeURIComponent(saison) : null;

    const user = session.user.id;

    let query = "";
    let params: any[] = [];

    if (saisonDecoded) {
      query = "CALL getanimehistory_saison(?, ?, ?, ?)";
      params = [animeDecoded, user, langueDecoded, saisonDecoded];
    } else if (langueDecoded) {
      query = "CALL getanimehistory_langue(?, ?, ?)";
      params = [animeDecoded, user, langueDecoded];
    } else {
      query = "CALL getanimehistory_base(?, ?)";
      params = [animeDecoded, user];
    }

    const [rows]: any = await db.query(query, params);
    const row = rows[0]?.[0];

    if (!row) {
      return new Response(null, { status: 204 });
    }    

    const animeData: Anime = {
      nom_anime: row.nom_anime,
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
