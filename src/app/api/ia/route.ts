import { NextResponse } from "next/server";

type AuroraRequest = {
  lat: number;
  lon: number;
  city?: string;
  noaaForecastText: string;
  targetHours: string[]; // ISO strings
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

    // Convertir toutes les heures cibles en UTC ISO
    const targetHoursUTC = targetHours.map((h) => new Date(h).toISOString());

    // Construire prompt pour l'IA
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

For each of the following hours (in UTC), predict the probability (0-100%) of seeing an aurora. Take into account local sunrise and sunset for the given lat/lon. Provide a short reason for the prediction.

Hours to predict:
${targetHoursUTC.map((h) => `- ${h}`).join("\n")}

Return ONLY a JSON array of objects like:
{ "time": "ISO timestamp", "percentage": 0-100, "reason": "short explanation" }
`;

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
          top_p: 1,
        }),
      }
    );

    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("Groq API error:", text);
      return NextResponse.json({ error: "Erreur Groq API" }, { status: 500 });
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content ?? "";
    console.log("AI raw response content:", content);

    // Parse tolérant
    let predictions: { time: string; percentage: number; reason: string }[] =
      [];
    try {
      const matches: string[] | null = content.match(/\{[^}]+\}/g);
      if (matches) {
        predictions = matches.map((m: string) => JSON.parse(m));
      }
    } catch (err) {
      console.error("Failed to parse AI response:", err, content);
      return NextResponse.json(
        { error: "Impossible de parser la réponse IA", raw: content },
        { status: 500 }
      );
    }

    return NextResponse.json(predictions);
  } catch (err) {
    console.error("Aurora POST error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la prédiction", predictions: [] },
      { status: 500 }
    );
  }
}
