"use client";

import { useEffect, useState } from "react";

type Prediction = {
  hour: string;
  percentage: number;
  reason: string;
};

export default function Home() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [city, setCity] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          // 1️⃣ Récupérer le nom de la ville
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const geoData = await geoRes.json();
          const cityName =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            geoData.address?.county ||
            "Unknown city";
          setCity(cityName);

          // 2️⃣ Appel au backend météo
          const meteoRes = await fetch("/api/meteo-forecast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lon }),
          });
          const meteoData = await meteoRes.json();
          const hourlyTimes: string[] = meteoData.hourlyTimes;
          const hourlyCloud: number[] = meteoData.hourlyCloud;

          // 3️⃣ Construire les targetHours
          const now = new Date();
          const targetHours: string[] = [];

          const addHour = (d: Date) => targetHours.push(d.toISOString());

          // now
          addHour(new Date(now));

          // 22h tonight
          const h22Tonight = new Date(now);
          h22Tonight.setHours(22, 0, 0, 0);
          addHour(h22Tonight);

          // 00h tomorrow
          const h00Tomorrow = new Date(now);
          h00Tomorrow.setDate(h00Tomorrow.getDate() + 1);
          h00Tomorrow.setHours(0, 0, 0, 0);
          addHour(h00Tomorrow);

          // 02h tomorrow
          const h02Tomorrow = new Date(h00Tomorrow);
          h02Tomorrow.setHours(2, 0, 0, 0);
          addHour(h02Tomorrow);

          // 22h tomorrow
          const h22Tomorrow = new Date(now);
          h22Tomorrow.setDate(h22Tomorrow.getDate() + 1);
          h22Tomorrow.setHours(22, 0, 0, 0);
          addHour(h22Tomorrow);

          // 00h after tomorrow
          const h00AfterTomorrow = new Date(now);
          h00AfterTomorrow.setDate(h00AfterTomorrow.getDate() + 2);
          h00AfterTomorrow.setHours(0, 0, 0, 0);
          addHour(h00AfterTomorrow);

          // 02h after tomorrow
          const h02AfterTomorrow = new Date(h00AfterTomorrow);
          h02AfterTomorrow.setHours(2, 0, 0, 0);
          addHour(h02AfterTomorrow);

          console.log("Target hours:", targetHours);

          // 4️⃣ Appel au backend Kp forecast
          const kpRes = await fetch("/api/kp-forecast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const kpData = await kpRes.json();

          // 5️⃣ Préparer le payload pour l'IA
          const auroraPayload = {
            lat,
            lon,
            city: cityName,
            noaaForecastText: kpData.fullForecastText,
            hourlyCloud,
            hourlyTimes,
            targetHours,
          };

          console.log("Payload IA:", auroraPayload);

          // 6️⃣ Appel au backend IA
          const iaRes = await fetch("/api/ia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(auroraPayload),
          });

          const iaData: Prediction[] = await iaRes.json();

          // 🔹 Simplification des raisons
          const simplifiedPredictions = iaData.map((p, i) => ({
            hour: targetHours[i], // on force l'heure cible
            percentage: p.percentage,
            reason: p.reason?.split(".")[0] ?? "No reason", // prend juste la première phrase
          }));

          setPredictions(simplifiedPredictions);
          setLoading(false);
        } catch (err) {
          console.error(err);
          setError("Failed to fetch data");
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve location");
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-black text-white p-4">
      <h1 className="text-4xl font-bold mb-4">
        {city ? `Welcome, user from ${city} 🚀` : "Welcome 🚀"}
      </h1>

      {loading && <p>Loading… ⏳</p>}

      {!loading && predictions.length > 0 && (
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Aurora Predictions</h2>
          <table className="border border-gray-500 text-white w-full">
            <thead>
              <tr>
                <th className="border px-2 py-1">Hour</th>
                <th className="border px-2 py-1">Chance %</th>
                <th className="border px-2 py-1">Reason</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">
                    {new Date(p.hour).toLocaleString()}
                  </td>
                  <td className="border px-2 py-1">{p.percentage}%</td>
                  <td className="border px-2 py-1">{p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
