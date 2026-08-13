// components/Header.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import MenuIcon from "@mui/icons-material/Menu";

export default function Header() {
  const pathname = usePathname();
  const { user, isLoading } = useUser();

  return (
    <header className="w-full flex p-4 relative z-10">
      {!user && pathname !== "/" && (
        <Link
          href="/"
          className="bg-gray-900/70 border border-white/10 px-4 py-2 rounded hover:bg-gray-800"
        >
          Home
        </Link>
      )}

      {!isLoading && (
        <>
          {user ? (
            <a
              href="/api/auth/logout"
              className="ml-auto bg-gray-900/70 border border-white/10 px-4 py-2 rounded hover:bg-gray-800"
            >
              Logout
            </a>
          ) : (
            pathname !== "/login" && (
              <Link
                href="/login"
                className="ml-auto bg-gray-900/70 border border-white/10 px-4 py-2 rounded hover:bg-gray-800"
              >
                Login
              </Link>
            )
          )}
        </>
      )}
    </header>
  );
}
