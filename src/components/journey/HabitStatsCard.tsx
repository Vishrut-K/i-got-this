import * as Icons from "lucide-react";

interface HabitStatsCardProps {
  name: string;
  color: string;
  iconId: string;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  completionRate: number;
}

export default function HabitStatsCard({
  name,
  color,
  iconId,
  currentStreak,
  bestStreak,
  totalCompletions,
  completionRate
}: HabitStatsCardProps) {
  const Icon = (Icons as any)[iconId] || Icons.Circle;

  return (
    <div className="flex flex-col p-4 rounded-xl border border-stone-200/50 dark:border-stone-800/50 bg-[#F4F4F0]/30 dark:bg-[#1A1A18]/30">
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
          style={{ backgroundColor: color, color: 'white' }}
        >
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <h3 className="font-serif font-bold text-lg text-stone-800 dark:text-stone-200">
          {name}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-sans tracking-widest uppercase text-stone-400 font-semibold mb-1">Current Streak</span>
          <span className="text-2xl font-bold font-sans tracking-tighter text-stone-700 dark:text-stone-300">
            {currentStreak} <span className="text-sm font-normal text-stone-400">days</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-sans tracking-widest uppercase text-stone-400 font-semibold mb-1">Best Streak</span>
          <span className="text-2xl font-bold font-sans tracking-tighter text-stone-700 dark:text-stone-300">
            {bestStreak} <span className="text-sm font-normal text-stone-400">days</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-sans tracking-widest uppercase text-stone-400 font-semibold mb-1">Completion Rate</span>
          <span className="text-2xl font-bold font-sans tracking-tighter text-stone-700 dark:text-stone-300">
            {completionRate}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-sans tracking-widest uppercase text-stone-400 font-semibold mb-1">Total Completions</span>
          <span className="text-2xl font-bold font-sans tracking-tighter text-stone-700 dark:text-stone-300">
            {totalCompletions}
          </span>
        </div>
      </div>
    </div>
  );
}
