import { NextResponse } from "next/server";

type AuroraRequest = {
  lat: number;
  lon: number;
  city?: string;
  noaaForecastText: string;
  targetHours: string[];
  hourlyCloud?: number[];
  hourlyTimes?: string[];
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      lat,
      lon,
      city,
      noaaForecastText,
      targetHours,
      hourlyCloud,
      hourlyTimes,
    } = body as AuroraRequest;

    if (!lat || !lon || !noaaForecastText || !targetHours?.length) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Convertir en UTC ISO
    const targetHoursUTC = targetHours.map((h) => new Date(h).toISOString());

    // Prompt IA
    const prompt = `
You are an expert in aurora borealis forecasting.

Location: ${city ?? "Unknown"} (${lat}, ${lon})

NOAA 3-Day Forecast Text:
${noaaForecastText}

Hourly cloud cover (if available):
${
  hourlyTimes && hourlyCloud
    ? hourlyTimes.map((t, i) => `${t}: ${hourlyCloud[i]}%`).join("\n")
    : "Not provided"
}

For each of the following hours (in UTC), give the aurora visibility percentage (0-100%) and a short reason.

Hours:
${targetHoursUTC.map((h) => `- ${h}`).join("\n")}

Return ONLY a JSON array like:
[
  { "time": "ISO", "percentage": 0-100, "reason": "short explanation" }
]
`;

    // Requête Groq
    const aiRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AURORA_GROQ}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          temperature: 0,
        }),
      }
    );

    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("Groq API error:", text);
      return NextResponse.json({ error: "Erreur Groq API" }, { status: 500 });
    }

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content ?? "";

    // --- PARSING ROBUSTE ---

    let predictions = [];

    try {
      // 1️⃣ Essaye de parser directement
      predictions = JSON.parse(raw);
    } catch {
      // 2️⃣ Si ça échoue, extrait le JSON à la main
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error("No JSON detected in AI output.");
        return NextResponse.json(
          { error: "Réponse IA invalide", raw },
          { status: 500 }
        );
      }

      try {
        predictions = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error("JSON extraction failed:", err);
        return NextResponse.json(
          { error: "Impossible de parser la réponse IA", raw },
          { status: 500 }
        );
      }
    }

    // Validation minimale
    predictions = predictions.map((p: any) => ({
      time: p.time ?? null,
      percentage: Number(p.percentage) || 0,
      reason: p.reason ?? "No reason",
    }));

    return NextResponse.json(predictions);
  } catch (err) {
    console.error("Aurora POST error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la prédiction" },
      { status: 500 }
    );
  }
}
