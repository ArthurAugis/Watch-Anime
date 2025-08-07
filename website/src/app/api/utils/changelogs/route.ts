import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Changelogs {
  codeChangeLog: string;
  date: Date;
  auteur: string;
  id: string;
}

export async function GET(req: Request) {
  try {
    let url: URL;
    url = new URL(req.url);
    const searchParams = url.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let rows: any;

    const [result] = await db.query(
      "CALL getChangeLogs(?, ?)",
      [limit, offset]
    );

    rows = result;

    if (!rows || rows.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const changelogs: Changelogs[] = rows[0].map((item: any): Changelogs => ({
        codeChangeLog: item.codeChangeLog,
        date: item.date,
        auteur: item.auteur || item.name,
        id: item.id
    }));

    return NextResponse.json(changelogs);
  } catch (error) {
    console.error("Erreur MySQL :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;
  const [rows] = await db.query("SELECT admin FROM users WHERE id = ?", [session.user.id]);
  return rows && (rows as any)[0]?.admin === 1;
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Non autorisé : vous devez être administrateur." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { ajouts } = body;
    const session = await getServerSession(authOptions);
    const auteur = session?.user?.id;
    if (!ajouts || typeof ajouts !== "string" || ajouts.trim() === "") {
      return NextResponse.json({ error: "Le champ 'ajouts' est requis et doit être une chaîne non vide." }, { status: 400 });
    }
    await db.query(
      "CALL addChangeLog(?, ?)",
      [ajouts, auteur]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur MySQL :", error);
    return NextResponse.json({
      error: error?.message || "Erreur inconnue lors de l'ajout du changelog."
    }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Non autorisé : vous devez être administrateur." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, ajouts } = body;
    if (!id) {
      return NextResponse.json({ error: "Le champ 'id' est requis." }, { status: 400 });
    }
    if (!ajouts || typeof ajouts !== "string" || ajouts.trim() === "") {
      return NextResponse.json({ error: "Le champ 'ajouts' est requis et doit être une chaîne non vide." }, { status: 400 });
    }
    const session = await getServerSession(authOptions);
    const auteur = session?.user?.id;
    await db.query(
      "CALL updateChangeLog(?, ?, ?)",
      [id, ajouts, auteur]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur MySQL :", error);
    return NextResponse.json({
      error: error?.message || "Erreur inconnue lors de la modification du changelog."
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Non autorisé : vous devez être administrateur." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Le champ 'id' est requis." }, { status: 400 });
    }
    const [result]: any = await db.query("CALL deleteChangeLog(?)", [id]);
    if (result?.affectedRows === 0) {
      return NextResponse.json({ error: "Aucun changelog trouvé avec cet id." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur MySQL :", error);
    return NextResponse.json({
      error: error?.message || "Erreur inconnue lors de la suppression du changelog."
    }, { status: 500 });
  }
}