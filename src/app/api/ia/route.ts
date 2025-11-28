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

// --- Parse NOAA text ---
function parseNOAA(text: string) {
  const lines = text.split("\n");
  const kp: Record<string, number> = {};
  const radiation: Record<string, number> = {};
  const blackout: Record<string, number> = {};

  const kpRegex = /^(\d\d-\d\dUT)\s+([\d.]+)/;
  for (const line of lines) {
    const match = line.match(kpRegex);
    if (match) kp[match[1]] = parseFloat(match[2]);
  }

  lines.forEach((line) => {
    const r = line.match(/^S1 or greater\s+(\d+)%/);
    if (r) radiation["S1"] = parseInt(r[1]);
  });

  lines.forEach((line) => {
    let r = line.match(/^R1-R2\s+(\d+)%/);
    if (r) blackout["R1-R2"] = parseInt(r[1]);
    r = line.match(/^R3 or greater\s+(\d+)%/);
    if (r) blackout["R3+"] = parseInt(r[1]);
  });

  return { kp, radiation, blackout };
}

// --- Convert UTC date to Sherbrooke local time ---
function toSherbrookeTime(utcDate: Date) {
  const offset = -5; // UTC-5 pour Sherbrooke (hiver)
  const local = new Date(utcDate);
  local.setHours(local.getUTCHours() + offset);
  return local;
}

// --- Check if night ---
function isNightSherbrooke(date: Date) {
  const local = toSherbrookeTime(date);
  const hour = local.getHours();
  return hour < 6 || hour >= 18;
}

// --- Adjust Kp by latitude ---
function kpToProbability(kp: number, lat: number) {
  // facteur linéaire de 40°N → 70°N : 0.4 → 1.0
  const factor = Math.min(
    Math.max(((lat - 40) / (70 - 40)) * 0.6 + 0.4, 0.4),
    1.0
  );
  const prob = kp * 10 * factor;
  return Math.round(prob);
}

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

    const targetDatesUTC = targetHours.map((h) => new Date(h));
    const parsedNOAA = parseNOAA(noaaForecastText);

    // --- Prepare prompt for IA ---
    const prompt = `
You are an expert in aurora forecasting. Use ONLY the data provided. Do NOT invent numbers.

Location: ${city ?? "Unknown"} (${lat}, ${lon})
Latitude: ${lat}°, Longitude: ${lon}°
Target hours (UTC): ${targetDatesUTC.map((d) => d.toISOString()).join(", ")}

NOAA Kp index per 3-hour window:
${Object.entries(parsedNOAA.kp)
  .map(([t, k]) => `- ${t}: Kp ${k}`)
  .join("\n")}

Solar Radiation Forecast: ${JSON.stringify(parsedNOAA.radiation)}
Radio Blackout Forecast: ${JSON.stringify(parsedNOAA.blackout)}

Hourly cloud cover (if available):
${
  hourlyTimes && hourlyCloud
    ? hourlyTimes.map((t, i) => `- ${t}: ${hourlyCloud[i]}%`).join("\n")
    : "Not provided"
}

Rules:
- Use latitude to adjust aurora probability (closer to pole = higher probability).
- If it is day at the target hour in Sherbrooke, visibility percentage = 0%.
- Take Kp index, radiation, blackout, cloud cover, and latitude into account.
- Return short reason for each hour.
- Do NOT invent numbers.

Return ONLY a JSON array:
[
  { "time": "ISO (Sherbrooke local)", "percentage": 0-100, "reason": "short explanation" }
]
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

    let predictions: any[] = [];
    try {
      predictions = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch)
        return NextResponse.json(
          { error: "Réponse IA invalide", raw },
          { status: 500 }
        );
      try {
        predictions = JSON.parse(jsonMatch[0]);
      } catch (err) {
        return NextResponse.json(
          { error: "Impossible de parser la réponse IA", raw },
          { status: 500 }
        );
      }
    }

    // --- Post-processing ---
    const finalPredictions = predictions.map((p: any, idx: number) => {
      const dateUTC = targetDatesUTC[idx];
      const night = isNightSherbrooke(dateUTC);
      const kpWindow = Object.entries(parsedNOAA.kp).find(([range]) => {
        const [startStr, endStr] = range.split("-").map((s) => parseInt(s));
        const hour = dateUTC.getUTCHours();
        return hour >= startStr && hour < endStr;
      });
      const kp = kpWindow ? kpWindow[1] : 0;
      const cloud = hourlyCloud?.[idx] ?? 0;

      let percentage = kpToProbability(kp, lat);
      let reason = "";
      let meteo = "";

      if (!night) {
        reason = "Daytime, aurora not visible";
        percentage = 0;
        meteo = "DAY";
      } else if (kp < 3) {
        reason = "Kp index too low";
      } else if (cloud > 50) {
        reason = "Cloud cover too high";
        percentage = Math.round(percentage * 0.5);
        meteo = "CLOUD";
      } else if (cloud > 20) {
        reason = "Moderate cloud cover";
        percentage = Math.round(percentage * 0.8);
        meteo = "CLOUDY";
      } else if (lat < 50 && percentage < 20) {
        reason = "Low latitude, aurora unlikely";
      } else {
        reason = "Clear conditions, aurora likely";
      }

      return {
        time: toSherbrookeTime(dateUTC).toISOString(),
        percentage,
        reason,
        meteo,
        kp,
      };
    });

    return NextResponse.json(finalPredictions);
  } catch (err) {
    console.error("Aurora POST error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la prédiction" },
      { status: 500 }
    );
  }
}
