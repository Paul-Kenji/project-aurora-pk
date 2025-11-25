import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = await fetch(
      "https://services.swpc.noaa.gov/text/3-day-forecast.txt"
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch NOAA forecast: ${res.status}`);
    }
    const text = await res.text();

    return NextResponse.json({
      fullForecastText: text,
    });
  } catch (err) {
    console.error("Error fetching NOAA 3-Day forecast:", err);
    return NextResponse.json(
      { error: "Failed to fetch NOAA 3-Day forecast" },
      { status: 500 }
    );
  }
}
