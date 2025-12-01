"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import AuroraLine from "./components/mainPage/AuroraLine";
import { KpGauge } from "./components/mainPage/KpGauge";
import MeteoIcon from "./components/mainPage/MeteoIcon";
import { Meteo } from "./types/forecast";
import GaugeIcon from "../assets/gauge-icon.png";

type Prediction = {
  hour: string;
  percentage: number;
  reason: string;
  meteo: Meteo;
  kp: number;
};

export default function Home() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [city, setCity] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------
  // GEO + API CALLS
  // -------------------------------------------------------
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLocation({ lat, lon });

        try {
          // 1. Reverse geocoding
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const geoData = await geoRes.json();

          const cityName =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            geoData.address?.county ||
            "Unknown";
          setCity(cityName);

          // 2. Meteo forecast
          const meteoRes = await fetch("/api/meteo-forecast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lon }),
          });
          const meteoData = await meteoRes.json();
          const hourlyTimes: string[] = meteoData.hourlyTimes;
          const hourlyCloud: number[] = meteoData.hourlyCloud;

          // ---------------------------------------------
          // TARGET HOURS
          // ---------------------------------------------
          const now = new Date();
          const targetHours: string[] = [];

          const addHour = (d: Date) => targetHours.push(d.toISOString());
          addHour(new Date(now)); // current
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

          // ---------------------------------------------
          // NOAA KP forecast
          // ---------------------------------------------
          const kpRes = await fetch("/api/kp-forecast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const kpData = await kpRes.json();

          // ---------------------------------------------
          // IA PAYLOAD
          // ---------------------------------------------
          const payload = {
            lat,
            lon,
            city: cityName,
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
              p: {
                percentage: number;
                reason: string;
                meteo: Meteo;
                kp: number;
              },
              i: number
            ) => ({
              hour: targetHours[i],
              percentage: p?.percentage ?? 0,
              reason: p?.reason?.split(".")[0] ?? "No reason",
              meteo: p?.meteo ?? "CLEAR",
              kp: p?.kp ?? 0,
            })
          );

          setPredictions(simplified);
        } catch (err) {
          console.error(err);
          setError("Failed to load data");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve location");
        setLoading(false);
      }
    );
  }, []);

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col items-center text-white">
      {/* CURRENT PREDICTION */}
      <div className="p-4 bg-gray-900/70 rounded-xl w-full max-w-md border border-white/10 backdrop-blur-md flex flex-col items-center">
        <h2 className="text-xl font-bold mb-2">
          Current Aurora in {city || "..."}
        </h2>

        {loading ? (
          <div className="animate-pulse space-y-2 w-full flex flex-col items-center">
            <div className="h-6 w-16 bg-gray-700 rounded"></div>
            <div className="h-4 w-32 bg-gray-700 rounded"></div>
          </div>
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
                    : predictions[0]?.meteo === "DAY"
                    ? "Too bright due to daylight"
                    : "Too cloudy"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-start mt-2 space-x-2 mt-4">
        <Image src={GaugeIcon} width={30} height={30} alt="Gauge Icon" />
        <div className="flex flex-col">
          <p className="text-xs">
            The Kp index is a simple measure of geomagnetic activity, ranging
            from 0 (calm) to 9 (very disturbed).
          </p>
          <p className="text-xs mt-1">
            We combine it with various NOAA data and weather forecasts to let
            our AI calculate the probability of seeing an aurora.
          </p>
        </div>
      </div>

      {/* TONIGHT */}
      <AuroraLine
        title="Tonight"
        items={predictions.slice(1, 4)}
        loading={loading}
      />

      {/* TOMORROW */}
      <AuroraLine
        title="Tomorrow"
        items={predictions.slice(4, 7)}
        loading={loading}
      />

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
