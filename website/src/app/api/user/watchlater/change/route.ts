import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth"; 
import { getServerSession } from "next-auth/next";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      admin?: boolean;
    };
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { anime } = body;

    if (!anime) {
      return NextResponse.json(
        { error: "Champ 'anime' (nom_url) requis" },
        { status: 400 }
      );
    }

    const animeDecoded = decodeURIComponent(anime);

    const userId = session.user.id;

    const [rows]: any = await db.query(
      "SELECT changewatchlaterstate(?, ?) AS state",
      [userId, animeDecoded]
    );

    const state = rows[0]?.state;

    if (state === -1) {
      return NextResponse.json({ error: "Erreur SQL interne" }, { status: 500 });
    }

    return NextResponse.json(
      {
        waterlatered: state === 1,
        action: state === 1 ? "waterlatered" : "unwaterlatered",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json(
      { error: "Erreur serveur : " + (error as Error).message },
      { status: 500 }
    );
  }
}
