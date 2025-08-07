import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import zlib from "zlib";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

interface AnimeLike {
  nomAnimeURL: string;
  nomAnime: string;
  afficheAnime: string;
  categorieAnime: string | null;
  langueAnime: string | null;
  subnameAnime: string | null;
  saisonsAnime: number | null;
  episodesAnime: number | null;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { offset = 0, limit = 100 } = await req.json();
    const userId = session.user.id;

    const [results]: any = await db.query("CALL getuserwatchlaters(?, ?, ?)", [
      userId,
      offset,
      limit,
    ]);

    const animeRows = results[0];

    if (!animeRows || animeRows.length === 0) {
      return new Response(null, { status: 204 });
    }

    const animes: AnimeLike[] = animeRows.map((item: any): AnimeLike => ({
      nomAnime: item.nom_anime,
      nomAnimeURL: item.nom_url_anime,
      afficheAnime: item.affiche_anime,
      categorieAnime: item.categorie_anime,
      langueAnime: item.langue_anime,
      subnameAnime: item.subname_anime,
      saisonsAnime: item.saisons_anime,
      episodesAnime: item.episodes_anime,
    }));

    return serveCompressedJSON(animes);
  } catch (error) {
    console.error("❌ Erreur MySQL :", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

function serveCompressedJSON(data: AnimeLike[]) {
  const jsonData = JSON.stringify(data);
  const compressedData = zlib.gzipSync(jsonData);

  return new Response(compressedData, {
    headers: {
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",
    },
  });
}
