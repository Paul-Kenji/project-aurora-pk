// KpGauge.tsx
import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type KpGaugeProps = {
  kp: number; // 0 à 9
};

export const KpGauge: React.FC<KpGaugeProps> = ({ kp }) => {
  // Définir couleur selon le Kp
  const getColor = (kp: number) => {
    if (kp <= 2) return "#4CAF50"; // vert
    if (kp <= 5) return "#FFEB3B"; // jaune
    if (kp <= 7) return "#FF9800"; // orange
    if (kp <= 9) return "#F44336"; // rouge
    return "#9C27B0"; // violet pour tempête extrême
  };

  return (
    <div style={{ width: 120, height: 120 }}>
      <CircularProgressbar
        value={kp * 10} // échelle 0-100
        maxValue={100}
        text={`Kp ${kp}`}
        styles={buildStyles({
          pathColor: getColor(kp),
          textColor: "#333",
          trailColor: "#eee",
          textSize: "16px",
        })}
      />
    </div>
  );
};
