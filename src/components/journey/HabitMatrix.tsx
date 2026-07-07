"use client";

import * as Icons from "lucide-react";

interface HabitMatrixProps {
  habits: { id: string; name: string; iconId: string; color: string }[];
  matrixDays: string[];
  habitMatrixData: Record<string, Record<string, string>>;
}

export default function HabitMatrix({ habits, matrixDays, habitMatrixData }: HabitMatrixProps) {
  // Helper to get the first letter of the day (e.g. M, T, W)
  const getDayLetter = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { weekday: 'short' })[0];
  };

  const getDayNumber = (dateStr: string) => {
    return dateStr.split('-')[2];
  };

  return (
    <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
      <div className="min-w-max flex flex-col gap-3">
        
        {/* Header Row (Days) */}
        <div className="flex items-end">
          {/* Label Column Placeholder */}
          <div className="w-40 sm:w-48 shrink-0"></div>
          {/* Days */}
          <div className="flex gap-2">
            {matrixDays.map((day, idx) => (
              <div key={idx} className="w-6 sm:w-8 flex flex-col items-center justify-end">
                <span className="text-[9px] font-sans tracking-widest text-stone-400 font-semibold">{getDayLetter(day)}</span>
                <span className="text-[10px] font-sans text-stone-500">{getDayNumber(day)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Habit Rows */}
        <div className="flex flex-col gap-3">
          {habits.map((habit) => {
            const Icon = (Icons as Record<string, React.ElementType>)[habit.iconId] || Icons.Circle;
            
            return (
              <div key={habit.id} className="flex items-center group">
                {/* Habit Label */}
                <div className="w-40 sm:w-48 shrink-0 flex items-center gap-2 pr-4">
                  <div className="w-5 h-5 flex items-center justify-center rounded" style={{ backgroundColor: habit.color, color: 'white' }}>
                    <Icon size={12} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate">
                    {habit.name}
                  </span>
                </div>
                
                {/* Habit Cells */}
                <div className="flex gap-2">
                  {matrixDays.map((day, idx) => {
                    const status = habitMatrixData[habit.id]?.[day] || "EMPTY";
                    
                    let cellClass = "w-6 h-6 sm:w-8 sm:h-8 rounded-[4px] border transition-colors flex items-center justify-center ";
                    
                    if (status === "DONE") {
                      cellClass += "bg-[#4A6750] dark:bg-[#5C7E63] border-[#4A6750] dark:border-[#5C7E63]";
                    } else if (status === "SKIP") {
                      cellClass += "bg-stone-200 dark:bg-stone-800 border-stone-200 dark:border-stone-800";
                    } else if (status === "UNAVAILABLE") {
                      cellClass += "bg-transparent border-transparent opacity-20";
                    } else {
                      cellClass += "bg-transparent border-stone-300 dark:border-stone-700";
                    }

                    return (
                      <div key={idx} className={cellClass} title={day}>
                        {status === "DONE" && (
                          <div className="w-2 h-2 rounded-sm bg-white/80" />
                        )}
                        {status === "SKIP" && (
                          <div className="w-1.5 h-1.5 rounded-sm bg-stone-400 dark:bg-stone-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
