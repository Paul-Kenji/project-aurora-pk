// KpGauge.tsx
import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type KpGaugeProps = {
  kp: number;
  diameter: number;
  text?: boolean;
};

export const KpGauge: React.FC<KpGaugeProps> = ({ kp, diameter, text }) => {
  const getColor = (kp: number) => {
    if (kp <= 2) return "#4CAF50"; // vert
    if (kp <= 5) return "#FFEB3B"; // jaune
    if (kp <= 7) return "#FF9800"; // orange
    if (kp <= 9) return "#F44336"; // rouge
    return "#9C27B0"; // violet pour tempête extrême
  };

  return (
    <div style={{ width: diameter, height: diameter }}>
      <CircularProgressbar
        value={kp * 10}
        maxValue={100}
        strokeWidth={10}
        styles={buildStyles({
          pathColor: getColor(kp),
          trailColor: "#eee",
          textColor: "#eee",
        })}
        text={text ? `KP ${kp}` : ""}
      />
    </div>
  );
};
