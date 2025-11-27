"use client";

type AuroraHourCardProps = {
  hour: string;
  percentage: number;
  reason: string;
};

export default function AuroraHourCard({
  hour,
  percentage,
  reason,
}: AuroraHourCardProps) {
  return (
    <div className="flex flex-col items-center p-3 bg-gray-900 rounded-xl w-24 shadow-md">
      <p className="text-sm font-semibold">{hour}</p>
      <p className="text-xl font-bold">{percentage}%</p>
      <p className="text-[10px] text-gray-400 text-center mt-1 leading-tight">
        {reason}
      </p>
    </div>
  );
}
