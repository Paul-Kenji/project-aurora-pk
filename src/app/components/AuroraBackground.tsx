"use client";

import React from "react";

const STATIC_COLOR = "#3caf73ff"; // Couleur de l'aurore
const STAR_COUNT = 50;

export default function AuroraBackground() {
  const stars = Array.from({ length: STAR_COUNT }).map(() => ({
    top: `${Math.random() * 40}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 2 + 1}px`,
    delay: Math.random() * 10, // pour des scintillements décalés
  }));

  return (
    <div
      style={{
        backgroundImage: `radial-gradient(150% 150% at 50% 0%, #020617 50%, ${STATIC_COLOR})`,
      }}
      className="fixed inset-0 -z-10 w-full h-full bg-no-repeat bg-cover"
    >
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            backgroundColor: "white",
            opacity: 0.8,
            animation: `twinkle 2s infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
}
