import type React from "react";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import AuroraBackground from "./components/AuroraBackground";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
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
          <Link
            href="/login"
            className="bg-gray-900/70 border border-white/10 px-4 py-2 rounded"
          >
            Login
          </Link>
        </header>

        {/* Contenu */}
        <UserProvider>
          <main className="relative z-10 min-h-screen">{children}</main>
        </UserProvider>

        <footer className="w-full p-4 relative z-10 flex justify-center items-center space-x-8">
          <p>© {new Date().getFullYear()} Aurora-PK</p>
          <p>Privacy Policy</p>
          <p>Terms of Uses</p>
          <p>About Us</p>
          <a
            href="https://www.linkedin.com/in/paul-kenji"
            rel="noopener noreferrer"
            className="flex items-center space-x-2"
          >
            <LinkedInIcon />
            <span>LinkedIn</span>
          </a>
        </footer>
      </body>
    </html>
  );
}
