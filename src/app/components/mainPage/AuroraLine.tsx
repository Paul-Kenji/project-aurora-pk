"use client";

import AuroraHourCard from "./AuroraHourCard";

type Prediction = {
  hour: string;
  percentage: number;
  reason: string;
};

type AuroraLineProps = {
  title: string;
  items: Prediction[]; // exactement 3 éléments
};

export default function AuroraLine({ title, items }: AuroraLineProps) {
  return (
    <div className="w-full max-w-md mt-6">
      <h3 className="text-lg font-bold mb-3">{title}</h3>

      <div className="flex justify-between">
        {items.map((p, i) => (
          <AuroraHourCard
            key={i}
            hour={new Date(p.hour).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            percentage={p.percentage}
            reason={p.reason}
          />
        ))}
      </div>
    </div>
  );
}
