import type React from "react";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import AuroraBackground from "./components/AuroraBackground";
import "./globals.css";
import Footer from "./components/globalPage/Footer";
import Header from "./components/globalPage/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="relative min-h-screen text-white">
        <AuroraBackground />
        <Header />
        {/* Contenu */}
        <UserProvider>
          <main className="relative z-10 min-h-screen">{children}</main>
        </UserProvider>
        <div className="mt-4">
          <Footer />
        </div>
      </body>
    </html>
  );
}
