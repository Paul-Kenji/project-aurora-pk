"use client";

import { Meteo } from "@/app/types/forecast";
import MeteoIcon from "./MeteoIcon";
import { KpGauge } from "./KpGauge";

type AuroraHourCardProps = {
  hour?: string;
  percentage: number;
  reason: string;
  meteo: Meteo;
  kp: number;
  loading: boolean;
};

export default function AuroraHourCard({
  hour,
  percentage,
  reason,
  meteo,
  kp,
  loading,
}: AuroraHourCardProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center p-3 bg-gray-900 rounded-xl w-24 shadow-md animate-pulse">
        <div className="h-4 w-10 bg-gray-700 rounded mb-2"></div>
        <div className="h-6 w-12 bg-gray-700 rounded mb-2"></div>
        <div className="h-3 w-16 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-3 bg-gray-900 rounded-xl w-24 shadow-md">
      <p className="text-sm font-semibold">{hour}</p>
      <p className="text-xl font-bold">{percentage}%</p>
      <div className="flex items-center space-x-2">
        <div title={`kp index : ${kp}`}>
          <KpGauge kp={kp} diameter={20} text={false} />
        </div>
        <div title={`Weather forecast: ${meteo ? meteo : "Clear sky"}`}>
          <MeteoIcon meteo={meteo} size="small" />
        </div>
      </div>
      <p className=" text-gray-400 text-center mt-1 leading-tight">{reason}</p>
    </div>
  );
}
