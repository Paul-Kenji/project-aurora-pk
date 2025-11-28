"use client";

type AuroraHourCardProps = {
  hour?: string;
  percentage: number;
  reason: string;
  loading: boolean;
};

export default function AuroraHourCard({
  hour,
  percentage,
  reason,
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
      <p className="text-[10px] text-gray-400 text-center mt-1 leading-tight">
        {reason}
      </p>
    </div>
  );
}
