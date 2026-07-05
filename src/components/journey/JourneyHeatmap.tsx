"use client";

import { useMemo } from "react";

export default function JourneyHeatmap({ data }: { data: Record<string, number> }) {
  // Generate the last 91 days (13 weeks * 7 days)
  const days = useMemo(() => {
    const arr = [];
    const today = new Date();
    // Start 365 days ago
    const start = new Date(today);
    start.setDate(start.getDate() - 365);
    
    // Fast forward to the nearest Sunday before start to align the grid
    while (start.getDay() !== 0) {
      start.setDate(start.getDate() - 1);
    }

    // Now push days until we pass today
    const curr = new Date(start);
    while (curr <= today || curr.getDay() !== 0) {
      // If we've passed today and reached the end of the week, stop
      if (curr > today && curr.getDay() === 0) break;
      
      const dateStr = new Date(curr.getTime() - curr.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      arr.push({
        date: dateStr,
        isFuture: curr > today,
        score: data[dateStr] ?? 0 // Default to 0
      });
      curr.setDate(curr.getDate() + 1);
    }
    return arr;
  }, [data]);

  // Weeks are groups of 7 days
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getColorClass = (score: number, isFuture: boolean) => {
    if (isFuture) return "bg-transparent border border-stone-200/50 dark:border-stone-700/50 opacity-20";
    if (score === -1) return "bg-stone-200 dark:bg-stone-700 opacity-50"; // Skipped, no progress
    if (score === 0) return "bg-stone-100 dark:bg-stone-800";
    if (score === 1) return "bg-[#b0c4b1] dark:bg-[#2c3d30]";
    if (score === 2) return "bg-[#84a59d] dark:bg-[#39513e]";
    if (score === 3) return "bg-[#52796f] dark:bg-[#45654d]";
    if (score >= 4) return "bg-[#354f52] dark:bg-[#527a5b]";
    return "bg-stone-100 dark:bg-stone-800";
  };

  return (
    <div className="flex flex-col w-full pb-2">
      <div className="flex w-full gap-[2px] sm:gap-1">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-[2px] sm:gap-1 flex-1">
            {week.map((day, dIdx) => (
              <div 
                key={dIdx} 
                className={`w-full aspect-square rounded-sm sm:rounded-[3px] transition-colors ${getColorClass(day.score, day.isFuture)}`}
                title={!day.isFuture ? `${day.date}` : undefined}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-6 text-[10px] uppercase tracking-widest font-semibold text-stone-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-stone-100 dark:bg-stone-800" />
          <div className="w-3 h-3 rounded-sm bg-[#b0c4b1] dark:bg-[#2c3d30]" />
          <div className="w-3 h-3 rounded-sm bg-[#84a59d] dark:bg-[#39513e]" />
          <div className="w-3 h-3 rounded-sm bg-[#52796f] dark:bg-[#45654d]" />
          <div className="w-3 h-3 rounded-sm bg-[#354f52] dark:bg-[#527a5b]" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
