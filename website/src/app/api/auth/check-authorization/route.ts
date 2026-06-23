import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ authorized: false }, { status: 401 });
    }

    if (!SITE_CONFIG.PRIVATE_MODE) {
      return NextResponse.json({ authorized: true });
    }

    const [rows] = await db.query(
      "SELECT id FROM users WHERE id = ?",
      [session.user.id]
    );

    const users = rows as { id: string }[];
    const authorized = users.length > 0;

    return NextResponse.json({ authorized });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'autorisation:", error);
    return NextResponse.json({ authorized: false }, { status: 500 });
  }
}
