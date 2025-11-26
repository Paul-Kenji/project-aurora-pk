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

  // ------------------------------------------------------------
  // 1️⃣ Récupération de la géolocalisation
  // ------------------------------------------------------------
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
          // ------------------------------------------------------------
          // 2️⃣ Reverse geocoding → nom de la ville
          // ------------------------------------------------------------
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

          // ------------------------------------------------------------
          // 3️⃣ Récupération prévision météo (cloud)
          // ------------------------------------------------------------
          const meteoRes = await fetch("/api/meteo-forecast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lon }),
          });

          const meteoData = await meteoRes.json();

          const hourlyTimes: string[] = meteoData.hourlyTimes;
          const hourlyCloud: number[] = meteoData.hourlyCloud;

          // ------------------------------------------------------------
          // 4️⃣ Construction des heures cibles
          // ------------------------------------------------------------
          const now = new Date();
          const targetHours: string[] = [];

          const addHour = (d: Date) => targetHours.push(d.toISOString());

          addHour(new Date(now)); // now

          // 22h tonight
          const h22Tonight = new Date(now);
          h22Tonight.setHours(22, 0, 0, 0);
          addHour(h22Tonight);

          // Tomorrow 00h
          const h00Tomorrow = new Date(now);
          h00Tomorrow.setDate(h00Tomorrow.getDate() + 1);
          h00Tomorrow.setHours(0, 0, 0, 0);
          addHour(h00Tomorrow);

          // Tomorrow 02h
          const h02Tomorrow = new Date(h00Tomorrow);
          h02Tomorrow.setHours(2, 0, 0, 0);
          addHour(h02Tomorrow);

          // Tomorrow 22h
          const h22Tomorrow = new Date(now);
          h22Tomorrow.setDate(h22Tomorrow.getDate() + 1);
          h22Tomorrow.setHours(22, 0, 0, 0);
          addHour(h22Tomorrow);

          // After tomorrow 00h
          const h00AfterTomorrow = new Date(now);
          h00AfterTomorrow.setDate(h00AfterTomorrow.getDate() + 2);
          h00AfterTomorrow.setHours(0, 0, 0, 0);
          addHour(h00AfterTomorrow);

          // After tomorrow 02h
          const h02AfterTomorrow = new Date(h00AfterTomorrow);
          h02AfterTomorrow.setHours(2, 0, 0, 0);
          addHour(h02AfterTomorrow);

          // ------------------------------------------------------------
          // 5️⃣ NOAA forecast (KP index et texte)
          // ------------------------------------------------------------
          const kpRes = await fetch("/api/kp-forecast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          const kpData = await kpRes.json();

          // ------------------------------------------------------------
          // 6️⃣ Construire payload IA
          // ------------------------------------------------------------
          const auroraPayload = {
            lat,
            lon,
            city: cityName,
            noaaForecastText: kpData.fullForecastText,
            hourlyCloud,
            hourlyTimes,
            targetHours,
          };

          console.log("Payload sent to backend IA:", auroraPayload);

          // ------------------------------------------------------------
          // 7️⃣ Appel backend IA (GROQ)
          // ------------------------------------------------------------
          const iaRes = await fetch("/api/ia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(auroraPayload),
          });

          const iaData = await iaRes.json();

          // ------------------------------------------------------------
          // 8️⃣ Simplification des prédictions
          // ------------------------------------------------------------
          const simplifiedPredictions = iaData.map(
            (p: { percentage: number; reason: string }, i: number) => ({
              hour: targetHours[i],
              percentage: p.percentage ?? 0,
              reason: p.reason?.split(".")[0] ?? "No reason",
            })
          );

          setPredictions(simplifiedPredictions);
        } catch (err) {
          console.error(err);
          setError("Failed to fetch data");
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

  // ------------------------------------------------------------
  // 🔹 Rendu du composant
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col items-center text-white p-4">
      {loading && <p>Loading… ⏳</p>}

      {!loading && predictions.length > 0 && (
        <>
          {/* Afficher la prédiction du moment séparément */}
          <div className="mb-6 p-4 bg-gray-800 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">
              Current Aurora Prediction in {city} :
            </h2>
            <p>
              Chance: {predictions[0].percentage}%<br />
              {predictions[0].reason}
            </p>
          </div>

          {/* Tableau pour les autres prédictions */}
          <div className="w-full max-w-md">
            <table className="border border-gray-500 text-white w-full">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Hour</th>
                  <th className="border px-2 py-1">Chance %</th>
                  <th className="border px-2 py-1">Reason</th>
                </tr>
              </thead>
              <tbody>
                {predictions.slice(1).map((p, i) => (
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
        </>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
