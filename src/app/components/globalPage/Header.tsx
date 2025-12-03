// components/Header.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="w-full flex p-4 relative z-10">
      {pathname !== "/" && (
        <Link
          href="/"
          className="bg-gray-900/70 border border-white/10 px-4 py-2 rounded hover:bg-gray-800"
        >
          Home
        </Link>
      )}
      <Link
        href="/login"
        className="ml-auto bg-gray-900/70 border border-white/10 px-4 py-2 rounded hover:bg-gray-800"
      >
        Login
      </Link>
    </header>
  );
}
