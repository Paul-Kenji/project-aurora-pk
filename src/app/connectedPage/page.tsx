// pages/connected.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function ConnectedPage() {
  // TOUS LES HOOKS DOIVENT ÊTRE DÉCLARÉS ICI, AU DÉBUT, INCONDITIONNELLEMENT
  const { user, isLoading } = useUser(); // Hook 1
  const [count, setCount] = useState<number>(0); // Hook 2
  const [counterLoading, setCounterLoading] = useState<boolean>(true); // Hook 3
  const [counterError, setCounterError] = useState<string | null>(null); // Hook 4

  // Fonction pour récupérer le compteur actuel de l'utilisateur
  // Cette fonction DOIT être définie ici, après les Hooks, mais avant les retours conditionnels
  async function getCounter() {
    setCounterLoading(true);
    setCounterError(null);
    try {
      if (!user?.sub) {
        throw new Error("User ID is not available");
      }
      console.log("UserID utilisé pour fetch le compteur:", user.sub);

      const res = await fetch(
        `/api/get-user-counter?userId=${encodeURIComponent(user.sub)}`,
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Impossible de récupérer le compteur",
        );
      }
      const data = await res.json();
      setCount(data.count);
    } catch (err: any) {
      console.error("Erreur lors de la récupération du compteur:", err);
      setCounterError("Erreur lors du chargement du compteur.");
    } finally {
      setCounterLoading(false);
    }
  }

  // Ce useEffect est maintenant toujours appelé, même si user/isLoading n'est pas prêt.
  useEffect(() => {
    // La logique de fetch ne s'exécute que si userId est disponible
    if (user?.sub) {
      // Utilise optional chaining au cas où user est null/undefined
      getCounter();
    }
  }, [user?.sub]); // Déclenche le re-fetch si user.sub change

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
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-4xl font-bold mb-4 text-center">
        Bienvenue, {user.name || user.email} !
      </h1>

      <div className="w-full max-w-sm bg-gray-900/70 border border-white/10 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold mb-3">Votre compteur personnel</h2>

        {counterLoading ? (
          <p className="text-gray-300">Chargement du compteur...</p>
        ) : counterError ? (
          <p className="text-red-400">{counterError}</p>
        ) : (
          <p className="text-gray-300">
            Compteur : <strong className="text-white">{count}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
