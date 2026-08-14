import { NextResponse } from "next/server";
import { clientPromise, dbName } from "../../../lib/mongodb";

export async function POST(req: Request) {
  try {
    const { userId, city } = await req.json();

    if (!userId || !city) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);

    await db
      .collection("userCities")
      .updateOne(
        { userId },
        { $set: { userId, city, updatedAt: new Date() } },
        { upsert: true },
      );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("save-user-city error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde" },
      { status: 500 },
    );
  }
}
