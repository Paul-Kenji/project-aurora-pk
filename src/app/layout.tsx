import type React from "react";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import AuroraBackground from "./components/AuroraBackground";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="relative min-h-screen text-white">
        <AuroraBackground />

        {/* Header */}
        <header className="w-full flex justify-end p-4 relative z-10">
          <Link href="/login" className="bg-blue-800 px-4 py-2 rounded">
            Se connecter
          </Link>
        </header>

        {/* Contenu */}
        <UserProvider>
          <main className="relative z-10 min-h-screen">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
