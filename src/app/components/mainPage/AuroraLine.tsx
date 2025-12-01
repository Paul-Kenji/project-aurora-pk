"use client";

import AuroraHourCard from "./AuroraHourCard";
import { motion, AnimatePresence } from "framer-motion";

type Prediction = {
  hour: string;
  percentage: number;
  reason: string;
  meteo?: string;
  kp?: number;
};

type AuroraLineProps = {
  title: string;
  items: Prediction[];
  loading: boolean;
};

export default function AuroraLine({ title, items, loading }: AuroraLineProps) {
  const displayItems = loading ? Array(3).fill({}) : items;

  return (
    <div className="w-full max-w-md mt-4">
      <h3 className="text-lg font-bold mb-2">{title}</h3>

      <div className="flex justify-between">
        {/* --- SKELETON (no animation) --- */}
        {loading && (
          <div className="flex justify-between w-full">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <AuroraHourCard
                  key={`skeleton-${i}`}
                  loading={true}
                  percentage={0}
                  reason={""}
                  meteo={"DAY"}
                  kp={0}
                />
              ))}
          </div>
        )}

        {/* --- REAL CARDS WITH ANIMATION --- */}
        {!loading && (
          <AnimatePresence key="loaded">
            {items.map((p: any, i: number) => (
              <motion.div
                key={i}
                initial={{ y: -12, opacity: 0 }} // départ au-dessus
                animate={{ y: 0, opacity: 1 }} // arrive à sa position
                exit={{ opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 10,
                  delay: i * 0.12, // stagger
                }}
              >
                <AuroraHourCard
                  hour={new Date(p.hour).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  percentage={p.percentage}
                  reason={p.reason}
                  meteo={p.meteo}
                  kp={p.kp}
                  loading={false}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
