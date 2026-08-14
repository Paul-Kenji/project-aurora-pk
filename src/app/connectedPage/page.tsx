// app/connectedPage/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import GlobalForecast from "../components/mainPage/GlobalForecast";

export default function ConnectedPage() {
  // TOUS LES HOOKS DOIVENT ÊTRE DÉCLARÉS ICI, AU DÉBUT, INCONDITIONNELLEMENT
  const { user, isLoading } = useUser(); // Hook 1

  // --- Ville favorite ---
  const [favoriteCity, setFavoriteCity] = useState<string | null>(null); // Hook 2
  const [favoriteLat, setFavoriteLat] = useState<number | null>(null); // Hook 3
  const [favoriteLon, setFavoriteLon] = useState<number | null>(null); // Hook 4
  const [cityInput, setCityInput] = useState<string>(""); // Hook 5
  const [cityLoading, setCityLoading] = useState<boolean>(true); // Hook 6
  const [citySaving, setCitySaving] = useState<boolean>(false); // Hook 7
  const [cityError, setCityError] = useState<string | null>(null); // Hook 8

  async function getFavoriteCity() {
    setCityLoading(true);
    setCityError(null);
    try {
      if (!user?.sub) return;
      const res = await fetch(
        `/api/get-user-city?userId=${encodeURIComponent(user.sub)}`,
      );
      if (!res.ok) throw new Error("Impossible de récupérer la ville");
      const data = await res.json();
      setFavoriteCity(data.city);
      setCityInput(data.city ?? "");
      setFavoriteLat(data.lat ?? null);
      setFavoriteLon(data.lon ?? null);
    } catch (err) {
      console.error("Erreur lors de la récupération de la ville:", err);
      setCityError("Erreur lors du chargement de la ville.");
    } finally {
      setCityLoading(false);
    }
  }

  async function saveFavoriteCity() {
    if (!user?.sub || !cityInput.trim()) return;
    setCitySaving(true);
    setCityError(null);
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          cityInput.trim(),
        )}&limit=1`,
      );
      const geoData = await geoRes.json();

      if (!geoData?.[0]) {
        throw new Error("Ville introuvable, vérifie l'orthographe.");
      }

      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);

      const res = await fetch("/api/save-user-city", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.sub,
          city: cityInput.trim(),
          lat,
          lon,
        }),
      });
      if (!res.ok) throw new Error("Impossible de sauvegarder la ville");

      setFavoriteCity(cityInput.trim());
      setFavoriteLat(lat);
      setFavoriteLon(lon);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de la ville:", err);
      setCityError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde.",
      );
    } finally {
      setCitySaving(false);
    }
  }

  useEffect(() => {
    if (user?.sub) {
      getFavoriteCity();
    }
  }, [user?.sub]);

  // --- LES RETOURS CONDITIONNELS Viennent APRÈS TOUS LES HOOKS ---

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="text-gray-300">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/api/auth/login";
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center text-white px-4">
      <h1 className="text-4xl font-bold mb-4 mt-8 text-center">
        Bienvenue, {user.name} !
      </h1>

      {/* Ville favorite */}
      <div className="w-full max-w-sm bg-gray-900/70 border border-white/10 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold mb-3">Votre ville favorite</h2>

        {cityLoading ? (
          <p className="text-gray-300">Chargement...</p>
        ) : (
          <>
            {favoriteCity && (
              <p className="text-gray-300 mb-3">
                Actuellement :{" "}
                <strong className="text-white">{favoriteCity}</strong>
              </p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Ex: Auckland"
                className="flex-1 bg-gray-800 border border-white/10 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
              <button
                onClick={saveFavoriteCity}
                disabled={citySaving || !cityInput.trim()}
                className="bg-white text-black font-semibold px-4 py-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {citySaving ? "..." : "Enregistrer"}
              </button>
            </div>
            {cityError && (
              <p className="text-red-400 text-sm mt-2">{cityError}</p>
            )}
          </>
        )}
      </div>

      {/* Prévisions aurore pour la ville favorite */}
      {favoriteCity && favoriteLat !== null && favoriteLon !== null && (
        <div className="mt-6 flex flex-col items-center w-full">
          <GlobalForecast
            lat={favoriteLat}
            lon={favoriteLon}
            city={favoriteCity}
          />
        </div>
      )}
    </div>
  );
}
