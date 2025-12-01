// KpGauge.tsx
import React, { useEffect, useState } from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type KpGaugeProps = {
  kp: number;
  diameter: number;
  text?: boolean;
};

export const KpGauge: React.FC<KpGaugeProps> = ({ kp, diameter, text }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const finalValue = kp * 10;

  useEffect(() => {
    let start: number | null = null;
    let phase: "full" | "settle" = "full";
    const durationFull = 800; // remplir entier rapidement
    const durationSettle = 1200; // revenir doucement

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      if (phase === "full") {
        const progress = Math.min(elapsed / durationFull, 1);
        setAnimatedValue(progress * 100);

        if (progress < 1) requestAnimationFrame(step);
        else {
          phase = "settle";
          start = null;
          requestAnimationFrame(step);
        }
      } else if (phase === "settle") {
        const progress = Math.min(elapsed / durationSettle, 1);
        setAnimatedValue(100 - (100 - finalValue) * easeOutCubic(progress));

        if (progress < 1) requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [finalValue]);

  const gradientId = `kp-gradient`;
  const getGradientStops = () => {
    const colors = ["#09f6cb", "#7247ff", "#ff00e1"];
    const step = 100 / (colors.length - 1);
    return colors.map((color, i) => (
      <stop key={i} offset={`${i * step}%`} stopColor={color} />
    ));
  };

  return (
    <div
      style={{
        width: diameter,
        height: diameter,
        filter: "drop-shadow(0 0 12px #000)",
      }}
    >
      <svg width="0" height="0">
        <defs>
          <linearGradient id={gradientId}>{getGradientStops()}</linearGradient>
        </defs>
      </svg>

      <CircularProgressbarWithChildren
        value={animatedValue}
        maxValue={100}
        strokeWidth={diameter <= 80 ? 25 : 10}
        styles={{
          path: {
            stroke: `url(#${gradientId})`,
            strokeLinecap: "round",
            transition: "stroke 0.3s linear",
          },
          trail: { stroke: "#eee" },
        }}
      >
        {text && (
          <div
            style={{ color: "#fff", fontSize: diameter / 5 }}
          >{`KP ${kp}`}</div>
        )}
      </CircularProgressbarWithChildren>
    </div>
  );
};
