"use client";

export default function HistoryGraphLegend() {
  const width = 60; // longueur mini-ligne
  const height = 6; // épaisseur ligne

  return (
    <div className=" space-x-6 items-center mt-2">
      {/* Middle Kp */}
      <div className="flex items-center space-x-2">
        <svg width={width} height={height}>
          <defs>
            <linearGradient
              id="legendGradientMiddle"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ffd341ff" />
              <stop offset="50%" stopColor="#98f0a9ff" />
              <stop offset="100%" stopColor="#2c74efff" />
            </linearGradient>
          </defs>
          <rect
            width={width}
            height={height}
            fill="url(#legendGradientMiddle)"
            rx={3}
          />
        </svg>
        <span className="text-sm text-gray-200">
          Middle Kp: Kp index for mid-latitude cities (e.g., Paris, New York,
          Tokyo, Buenos Aires, Wellington)
        </span>
      </div>

      {/* High Kp */}
      <div className="flex items-center space-x-2">
        <svg width={width} height={height}>
          <defs>
            <linearGradient
              id="legendGradientHigh"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#09f6cb" />
              <stop offset="50%" stopColor="#7247ff" />
              <stop offset="100%" stopColor="#ff00e1" />
            </linearGradient>
          </defs>
          <rect
            width={width}
            height={height}
            fill="url(#legendGradientHigh)"
            rx={3}
          />
        </svg>
        <span className="text-sm text-gray-200">
          High Kp: Kp index for high-latitude cities (e.g., Tromsø, Reykjavik,
          Dunedin, Yakutsk, Yellowknife)
        </span>
      </div>
    </div>
  );
}
