"use client";

import { useState } from "react";
import ModalTerms from "../mainPage/ModalTerms";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Link from "next/link";

export default function Footer() {
  const [openTerms, setOpenTerms] = useState(false);

  return (
    <>
      <footer className="w-full p-4 flex flex-col md:flex-row justify-center md:justify-between items-center space-y-3 md:space-y-0 md:space-x-8 text-center text-sm">
        <p>© {new Date().getFullYear()} Aurora-PK</p>
        <button
          onClick={() => setOpenTerms(true)}
          className="hover:text-gray-400 "
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setOpenTerms(true)}
          className="hover:text-gray-400 "
        >
          Terms and conditions
        </button>
        <Link href="/about-us" className="hover:text-gray-400 ">
          About Us
        </Link>
        <a
          href="https://www.linkedin.com/in/paul-kenji"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 hover:text-gray-400"
        >
          <LinkedInIcon />
          <span>LinkedIn</span>
        </a>
      </footer>

      <ModalTerms
        isOpen={openTerms}
        onClose={() => setOpenTerms(false)}
        title="Terms & Privacy"
      ></ModalTerms>
    </>
  );
}
