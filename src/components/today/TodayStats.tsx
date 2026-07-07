
export default function TodayStats({
  completedCount,
  totalCount,
  percentageOverride
}: {
  completedCount: number, totalCount: number, percentageOverride?: number
}) {
  const defaultPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const progressPercentage = percentageOverride !== undefined ? percentageOverride : defaultPercentage;
  
  
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
          className="h-full transition-all duration-200 ease-out rounded-full bg-theme-accent"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

    </div>
  );
}
