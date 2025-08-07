import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";

interface Lecteur {
  nom_lecteur: string;
  lecteur_id: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const anime = searchParams.get("anime");
    const lang = searchParams.get("lang");
    const season = searchParams.get("season");
    const episode = searchParams.get("episode");

    const animeDecoded = anime ? decodeURIComponent(anime) : null;
    const langDecoded = lang ? decodeURIComponent(lang) : null;
    const seasonDecoded = season ? decodeURIComponent(season) : null;
    const episodeDecoded = episode ? decodeURIComponent(episode) : null;

    const [rows]: any = await db.query(
      "CALL proc_getAnimeLecteurs(?, ?, ?, ?)",
      [animeDecoded, langDecoded, seasonDecoded, episodeDecoded]
    );

    const rowList = rows?.[0];

    if (!rowList || rowList.length === 0) {
      return new Response(null, { status: 204 });
    }

    const lecteursData: Lecteur[] = rowList.map((r: any) => ({
      nom_lecteur: r.lecteur_nom,
      lecteur_id: r.lecteur_id,
    }));

    return serveCompressedJSON(lecteursData);
  } catch (error) {
    console.error("Erreur MySQL :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function serveCompressedJSON(data: Lecteur[]) {
  const jsonData = JSON.stringify(data);
  const compressedData = zlib.gzipSync(jsonData);

  return new Response(compressedData, {
    headers: {
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",
    },
  });
}
