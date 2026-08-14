"use client";

import { useEffect, useState } from "react";
import AuroraLine from "./AuroraLine";
import { KpGauge } from "./KpGauge";
import MeteoIcon from "./MeteoIcon";
import { Meteo, Prediction } from "../../types/forecast";

type GlobalForecastProps = {
  lat: number | null;
  lon: number | null;
  city: string | null;
};

export default function GlobalForecast({
  lat,
  lon,
  city,
}: GlobalForecastProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat === null || lon === null || !city) return;

    async function loadForecast() {
      setLoading(true);
      setError(null);
      try {
        const meteoRes = await fetch("/api/meteo-forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon }),
        });
        const meteoData = await meteoRes.json();
        const hourlyTimes: string[] = meteoData.hourlyTimes;
        const hourlyCloud: number[] = meteoData.hourlyCloud;

        const now = new Date();
        const targetHours: string[] = [];
        const addHour = (d: Date) => targetHours.push(d.toISOString());

        addHour(new Date(now));
        const tonight22 = new Date(now);
        tonight22.setHours(22, 0, 0, 0);
        addHour(tonight22);
        const tom00 = new Date(now);
        tom00.setDate(tom00.getDate() + 1);
        tom00.setHours(0, 0, 0, 0);
        addHour(tom00);
        const tom02 = new Date(tom00);
        tom02.setHours(2, 0, 0, 0);
        addHour(tom02);
        const tom22 = new Date(now);
        tom22.setDate(tom22.getDate() + 1);
        tom22.setHours(22, 0, 0, 0);
        addHour(tom22);
        const aft00 = new Date(now);
        aft00.setDate(aft00.getDate() + 2);
        aft00.setHours(0, 0, 0, 0);
        addHour(aft00);
        const aft02 = new Date(aft00);
        aft02.setHours(2, 0, 0, 0);
        addHour(aft02);

        const kpRes = await fetch("/api/kp-forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const kpData = await kpRes.json();

        const payload = {
          lat,
          lon,
          city,
          noaaForecastText: kpData.fullForecastText,
          hourlyCloud,
          hourlyTimes,
          targetHours,
        };

        const iaRes = await fetch("/api/ia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const iaData = await iaRes.json();

        const simplified = iaData.map(
          (
            p: { percentage: number; reason: string; meteo: Meteo; kp: number },
            i: number,
          ) => ({
            hour: targetHours[i],
            percentage: p?.percentage ?? 0,
            reason: p?.reason?.split(".")[0] ?? "No reason",
            meteo: p?.meteo ?? "CLEAR",
            kp: p?.kp ?? 0,
          }),
        );

        setPredictions(simplified);
      } catch (err) {
        console.error("Erreur lors du chargement des prévisions:", err);
        setError("Impossible de charger les prévisions.");
      } finally {
        setLoading(false);
      }
    }

    loadForecast();
  }, [lat, lon, city]);

  return (
    <>
      <div className="p-4 bg-gray-900/70 rounded-xl w-full max-w-md border border-white/10 backdrop-blur-md flex flex-col items-center">
        <h2 className="text-xl font-bold mb-2">
          Current Aurora in {city || "..."}
        </h2>

        {loading ? (
          <div className="animate-pulse space-y-2 w-full flex flex-col items-center">
            <div className="h-6 w-16 bg-gray-700 rounded"></div>
            <div className="h-4 w-32 bg-gray-700 rounded"></div>
          </div>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <>
            <p className="text-lg font-semibold mb-2">
              {predictions[0]?.percentage}% chance
            </p>
            <p className="text-gray-300 mb-2">{predictions[0]?.reason}</p>
            <div className="flex items-center space-x-6">
              <KpGauge
                kp={predictions[0]?.kp ?? 0}
                diameter={100}
                text={true}
              />
              <div className="flex flex-col items-center mt-2">
                <MeteoIcon meteo={predictions[0]?.meteo} size="large" />
                <span className="mt-2 text-sm">
                  {predictions[0]?.meteo === "CLEAR"
                    ? "Clear"
                    : predictions[0]?.meteo === "CLOUD"
                      ? "Too cloudy"
                      : predictions[0]?.meteo === "CLOUDY"
                        ? "Too cloudy"
                        : predictions[0]?.meteo === "DAY"
                          ? "Too bright due to daylight"
                          : "The sky is clear"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {error ? null : (
        <>
          <AuroraLine
            title="Tonight"
            items={predictions.slice(1, 4)}
            loading={loading}
          />
          <AuroraLine
            title="Tomorrow"
            items={predictions.slice(4, 7)}
            loading={loading}
          />
        </>
      )}
    </>
  );
}
