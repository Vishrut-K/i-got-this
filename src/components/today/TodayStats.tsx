import { PRODUCTIVE_THRESHOLD } from "@/lib/constants";

export default function TodayStats({
  completedCount,
  totalCount,
  percentageOverride
}: {
  completedCount: number, totalCount: number, percentageOverride?: number
}) {
  const defaultPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const progressPercentage = percentageOverride !== undefined ? percentageOverride : defaultPercentage;
  
  const isProductive = progressPercentage >= PRODUCTIVE_THRESHOLD;

  return (
    <div className="flex items-center gap-4 py-1">
      
      {/* 1. Percentage & Count */}
      <div className="flex items-baseline gap-2 min-w-fit">
        <span className="text-3xl font-sans font-medium tracking-tighter text-stone-900 dark:text-stone-100 leading-none">
          {progressPercentage}<span className="text-lg text-stone-400 ml-0.5">%</span>
        </span>
        <span className="text-[10px] text-stone-500 font-medium tracking-widest uppercase">
          {completedCount} <span className="opacity-50">/</span> {totalCount}
        </span>
      </div>

      {/* 2. Thin Progress Bar */}
      <div className="flex-1 h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            isProductive ? "bg-[#4A6750] dark:bg-[#5C7E63]" : "bg-[#A96455] dark:bg-[#C27A68]"
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

    </div>
  );
}
