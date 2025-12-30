"use client";
import { useState } from "react";

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&?/]+)/
  );
  return match ? match[1] : null;
}

type Props = {
  url: string;
  title: string;
  description?: string;
};

export function Card({ url, title, description }: Props) {
  const [play, setPlay] = useState(false);
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-gray-900/70 border border-white/10 backdrop-blur-md shadow-lg h-full">
      {/* VIDEO */}
      <div className="relative h-60 shrink-0">
        {play ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlay(true)}
            className="h-full w-full relative"
          >
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={title}
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center text-5xl text-white">
              ▶
            </span>
          </button>
        )}
      </div>

      {/* TEXT */}
      <div className="flex-1 p-4 overflow-auto text-white">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
