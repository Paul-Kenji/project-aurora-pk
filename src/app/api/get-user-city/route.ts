import { NextRequest, NextResponse } from "next/server";
import { clientPromise, dbName } from "../../../lib/mongodb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { message: "userId is required" },
      { status: 400 },
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection("userCities");

    const doc = await collection.findOne({ userId });
    console.log("Document trouvé:", doc);
    console.log("userId", userId);

    // Pas de doc = utilisateur qui n'a jamais enregistré de ville.
    // On renvoie juste null, pas d'erreur, pas de création automatique.
    return NextResponse.json({ city: doc?.city ?? null });
  } catch (error) {
    console.error("Erreur API /get-user-city :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
