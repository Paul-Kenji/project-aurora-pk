"use client";

import { KpPoint } from "@/app/types/forecast";
import { useEffect, useState } from "react";

function getSmoothPath(
  data: KpPoint[],
  key: "middleKp" | "highKp",
  scaleX: (d: any, i: number) => number,
  scaleY: (kp: number) => number
) {
  if (data.length === 0) return "";
  let d = `M ${scaleX(data[0], 0)} ${scaleY(data[0][key])}`;
  for (let i = 0; i < data.length - 1; i++) {
    const x0 = scaleX(data[i], i);
    const y0 = scaleY(data[i][key]);
    const x1 = scaleX(data[i + 1], i + 1);
    const y1 = scaleY(data[i + 1][key]);
    const cpX = (x0 + x1) / 2;
    d += ` C ${cpX} ${y0}, ${cpX} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

export default function HistoryGraph({ data }: { data: KpPoint[] }) {
  const [windowWidth, setWindowWidth] = useState(800);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const width = Math.min(800, windowWidth - 20);
  const height = 300;
  const padding = 40;
  const maxKp =
    Math.max(...data.map((d) => Math.max(d.middleKp, d.highKp))) * 1.1;

  const stepX = (width - padding * 2) / (data.length - 1);
  const scaleX = (_: any, i: number) => padding + i * stepX;
  const scaleY = (kp: number) =>
    height - padding - (kp / maxKp) * (height - padding * 2);

  const middlePath = getSmoothPath(data, "middleKp", scaleX, scaleY);
  const highPath = getSmoothPath(data, "highKp", scaleX, scaleY);

  const horizontalLines = [];
  for (let kp = 0; kp <= maxKp; kp += 3) {
    horizontalLines.push(
      <line
        key={kp}
        x1={padding}
        y1={scaleY(kp)}
        x2={width - padding}
        y2={scaleY(kp)}
        stroke="#555"
        strokeWidth={0.5}
      />
    );
  }

  const yLabels = [];
  for (let kp = 0; kp <= Math.ceil(maxKp); kp += 3) {
    yLabels.push(
      <text
        key={kp}
        x={padding - 25}
        y={scaleY(kp) + 4}
        fontSize={windowWidth < 500 ? 16 : 12}
        fill="#ccc"
      >
        {kp}
      </text>
    );
  }

  const xLabelStep = windowWidth < 500 ? 8 : 5;

  return (
    <div className="mt-2 w-full overflow-x-auto flex justify-center relative">
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y - 30,
            backgroundColor: "#222",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: 4,
            fontSize: 12,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {tooltip.text}
        </div>
      )}
      <svg
        width={width}
        height={height}
        style={{ border: "1px solid #333", borderRadius: 12 }}
      >
        <defs>
          <linearGradient
            id="kpGradientMiddle"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#ffd341ff" />
            <stop offset="50%" stopColor="#98f0a9ff" />
            <stop offset="100%" stopColor="#2c74efff" />
          </linearGradient>
          <linearGradient id="kpGradientHigh" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#09f6cb" />
            <stop offset="50%" stopColor="#7247ff" />
            <stop offset="100%" stopColor="#ff00e1" />
          </linearGradient>
        </defs>

        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#777"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#777"
        />

        {horizontalLines}

        {/* Courbes */}
        <path
          d={middlePath}
          stroke="url(#kpGradientMiddle)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={highPath}
          stroke="url(#kpGradientHigh)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Points interactifs */}
        {data.map((d, i) => {
          const x = scaleX(d, i);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={scaleY(d.middleKp)}
                r={6}
                fill="transparent"
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    text: `Middle Kp: ${d.middleKp}`,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              />
              <circle
                cx={x}
                cy={scaleY(d.highKp)}
                r={6}
                fill="transparent"
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    text: `High Kp: ${d.highKp}`,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          );
        })}

        {yLabels}

        {/* Labels X */}
        {data.map((d, i) =>
          i % xLabelStep === 0 ? (
            <text
              key={i}
              x={scaleX(d, i) - 15}
              y={height - padding + (windowWidth < 500 ? 25 : 15)}
              fontSize={windowWidth < 500 ? 16 : 10}
              fill="#ccc"
            >
              {d.date.slice(5)}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}
