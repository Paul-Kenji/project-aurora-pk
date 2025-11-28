"use client";

import AuroraHourCard from "./AuroraHourCard";

type Prediction = {
  hour: string;
  percentage: number;
  reason: string;
};

type AuroraLineProps = {
  title: string;
  items: Prediction[];
  loading: boolean;
};

export default function AuroraLine({ title, items, loading }: AuroraLineProps) {
  // Si loading, créer 3 placeholders
  const displayItems = loading ? Array(3).fill({}) : items;

  return (
    <div className="w-full max-w-md mt-6">
      <h3 className="text-lg font-bold mb-3">{title}</h3>

      <div className="flex justify-between">
        {displayItems.map((p: any, i: number) => (
          <AuroraHourCard
            key={i}
            hour={
              loading
                ? undefined
                : new Date(p.hour).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
            }
            percentage={p.percentage}
            reason={p.reason}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}
