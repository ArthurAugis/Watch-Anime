import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";

interface Saisons {
  nom_saison: string;
  num_saison: number;
  nom_saison_url: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const anime = searchParams.get("anime");
    const langue = searchParams.get("langue");

    const animeDecoded = anime ? decodeURIComponent(anime) : null;
    const langueDecoded = langue ? decodeURIComponent(langue) : null;

    const [results]: any = await db.query(
      "CALL proc_getAnimeSaisons(?, ?)",
      [animeDecoded, langueDecoded]
    );

    const rowList = results[0];

    if (!rowList || rowList.length === 0) {
      return new Response(null, { status: 204 });
    }

    const saisonsData: Saisons[] = rowList.map((r: any) => ({
      nom_saison: r.saison_nom,
      num_saison: r.saison_num,
      nom_saison_url: r.saison_nom_url,
    }));

    return serveCompressedJSON(saisonsData);
  } catch (error) {
    console.error("Erreur MySQL :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function serveCompressedJSON(data: Saisons[]) {
  const jsonData = JSON.stringify(data);
  const compressedData = zlib.gzipSync(jsonData);

  return new Response(compressedData, {
    headers: {
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",
    },
  });
}
