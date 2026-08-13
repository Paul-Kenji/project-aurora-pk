"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Évite l'erreur d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  const handleSignUp = () => {
    window.location.href = "/api/auth/signup";
  };

  // Pendant l'hydratation, affiche un état de chargement simple
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="text-gray-300">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-4xl font-bold mb-4 text-center">Welcome</h1>

      <p className="text-gray-300 text-center mb-10 max-w-md">
        Please log in or create an account to continue.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={handleSignUp}
          className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
        >
          Create account
        </button>

        <button
          onClick={handleLogin}
          className="w-full py-3 rounded-lg border border-gray-500 text-white font-semibold hover:border-white transition-colors"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
