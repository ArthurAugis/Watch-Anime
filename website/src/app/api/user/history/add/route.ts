import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { anime, lang, season, episode } = body;

    const animeDecoded = decodeURIComponent(anime);
    const langDecoded = decodeURIComponent(lang);
    const seasonDecoded = decodeURIComponent(season);
    const episodeDecoded = decodeURIComponent(episode);

    if (!animeDecoded || !langDecoded || !seasonDecoded || !episodeDecoded) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const user = session.user.id;

    const [rows]: any = await db.query(
      "SELECT addtohistory(?, ?, ?, ?, ?) AS result",
      [user, animeDecoded, langDecoded, seasonDecoded, episodeDecoded]
    );

    const result = rows[0]?.result;

    if (result === 1) {
      return NextResponse.json({ message: "Ajout à l'historique réussi" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Échec de l'ajout à l'historique" }, { status: 400 });
    }
  } catch (error) {
    console.error("Erreur MySQL :", error);
    return NextResponse.json({ error: "Erreur serveur : " + error }, { status: 500 });
  }
}
