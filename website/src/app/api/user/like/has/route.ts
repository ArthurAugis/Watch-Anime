import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { animeId } = await req.json();

    if (!animeId) {
      return NextResponse.json(
        { error: "Le champ 'animeId' est requis." },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const [rows]: any = await db.query(
      "SELECT haslike(?, ?) AS liked",
      [userId, animeId]
    );

    const liked = rows[0]?.liked === 1;

    return NextResponse.json({ liked }, { status: 200 });
  } catch (error) {
    console.error("Erreur MySQL :", error);
    return NextResponse.json(
      { error: "Erreur serveur : " + (error as Error).message },
      { status: 500 }
    );
  }
}
