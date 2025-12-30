import { NextResponse } from "next/server";

function parseGeomagneticForGraph(text: string) {
  const lines = text.split("\n");
  const data: { date: string; middleKp: number; highKp: number }[] = [];

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 15 && /^\d{4}$/.test(parts[0])) {
      // Fredericksburg K indices = parts[2] à parts[9] (8 valeurs)
      const middleKpValues = parts.slice(2, 10).map((v) => parseFloat(v));
      const middleKp =
        middleKpValues.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0) /
        middleKpValues.length;

      // College K indices = parts[11] à parts[18] (8 valeurs)
      const highKpValues = parts.slice(11, 19).map((v) => parseFloat(v));
      const highKp =
        highKpValues.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0) /
        highKpValues.length;

      const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
      data.push({ date, middleKp, highKp });
    }
  }

  return data;
}

export async function POST() {
  try {
    const res = await fetch(
      "https://services.swpc.noaa.gov/text/daily-geomagnetic-indices.txt"
    );
    if (!res.ok)
      throw new Error(`Failed to fetch NOAA geomagnetic data: ${res.status}`);

    const text = await res.text();
    const parsedData = parseGeomagneticForGraph(text);
    return NextResponse.json({ data: parsedData });
  } catch (err) {
    console.error("Error fetching NOAA daily geomagnetic data:", err);
    return NextResponse.json(
      { error: "Failed to fetch NOAA daily geomagnetic data" },
      { status: 500 }
    );
  }
}
