import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lat, lon } = await req.json();

    // Météo
    const meteoRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloud_cover&daily=sunrise,sunset&forecast_days=3&timezone=auto`
    );
    const meteoData = await meteoRes.json();

    return NextResponse.json({
      hourlyTimes: meteoData.hourly.time,
      hourlyCloud: meteoData.hourly.cloud_cover,
    });
  } catch (e) {
    console.error(e);
    return new NextResponse("Error fetching forecast", { status: 500 });
  }
}
