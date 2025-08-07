import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";

interface Anime {
  nomAnime: string;
  nomAnimeURL: string;
  afficheAnime: string;
  saisonsAnime: number;
  episodesAnime: number;
  categories: string[];
  langues: string[];
  subnames: string[];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    let search = searchParams.get("search") || "";
    let filters = searchParams.get("filters") || null;

    search = decodeURIComponent(search).trim();
    if (filters !== null) {
      filters = decodeURIComponent(filters).trim();
      if (filters.length === 0) {
        filters = null;
      }
    }

    let rows: any;

    if (search.length > 0 || filters !== null) {
      const [result] = await db.query(
        "CALL searchanimes(?, ?, ?, ?)",
        [limit, offset, search, filters]
      );
      rows = result;
    } else {
      const [result] = await db.query(
        "CALL getanimes(?, ?)",
        [limit, offset]
      );
      rows = result;
    }

    if (!rows || rows.length === 0) {
      return new Response(null, { status: 204 });
    }

    const animes: Anime[] = rows[0].map((item: any): Anime => ({
      nomAnime: item.nom_anime,
      nomAnimeURL: item.nom_url_anime,
      afficheAnime: item.affiche_anime,
      saisonsAnime: item.saisons_anime ?? 0,
      episodesAnime: item.episodes_anime ?? 0,
      categories: item.categorie_anime ? item.categorie_anime.split(", ") : [],
      langues: item.langue_anime ? item.langue_anime.split(", ") : [],
      subnames: item.subname_anime ? item.subname_anime.split(", ") : [],
    }));

    return serveCompressedJSON(animes);
  } catch (error) {
    console.error("Erreur MySQL :", error);
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
