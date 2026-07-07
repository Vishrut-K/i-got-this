import { getJourneyStats } from "@/server/actions";
import JourneyHeatmap from "@/components/journey/JourneyHeatmap";
import HabitStatsCard from "@/components/journey/HabitStatsCard";
import { Award, CalendarDays } from "lucide-react";

export const metadata = {
  title: "Journey | I-got-this",
};

export default async function JourneyPage() {
  const stats = await getJourneyStats();

  return (
    <main className="max-w-7xl mx-auto px-6 sm:px-8 pb-32 pt-2 flex flex-col h-full min-h-screen">
      
      {/* 1. Header */}
      <header className="flex flex-col items-center justify-center border-b border-stone-200/50 dark:border-stone-800/50 pb-8 mb-12 mt-4">
        <h1 className="text-[10px] font-sans tracking-[0.3em] uppercase text-stone-400 font-bold mb-2">
          Your Journey
        </h1>
        <div className="w-12 h-px bg-stone-300 dark:bg-stone-700"></div>
      </header>

      {/* 2. Lifetime Scoreboard */}
      <section className="mb-16">
        <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-stone-500 font-bold mb-6 flex items-center gap-4">
          Lifetime Scoreboard
          <div className="flex-1 h-px bg-stone-200/50 dark:bg-stone-800/50"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col p-6 rounded-2xl bg-[#F4F4F0]/50 dark:bg-[#1A1A18]/50 border border-stone-200/50 dark:border-stone-800/50">
            <span className="text-xs font-sans tracking-[0.2em] uppercase text-stone-400 font-bold mb-2">Total Completed</span>
            <span className="text-5xl font-light font-sans tracking-tighter text-stone-800 dark:text-stone-200">
              {stats.totalCompletions}
            </span>
          </div>
          <div className="flex flex-col p-6 rounded-2xl bg-[#F4F4F0]/50 dark:bg-[#1A1A18]/50 border border-stone-200/50 dark:border-stone-800/50">
            <span className="text-xs font-sans tracking-[0.2em] uppercase text-stone-400 font-bold mb-2">Best Active Streak</span>
            <span className="text-5xl font-light font-sans tracking-tighter text-[#4A6750] dark:text-[#5C7E63] flex items-baseline gap-2">
              {stats.longestActiveStreak} <span className="text-lg text-stone-400 font-medium">days</span>
            </span>
          </div>
          <div className="flex flex-col p-6 rounded-2xl bg-[#F4F4F0]/50 dark:bg-[#1A1A18]/50 border border-stone-200/50 dark:border-stone-800/50">
            <span className="text-xs font-sans tracking-[0.2em] uppercase text-stone-400 font-bold mb-2">Perfect Days</span>
            <span className="text-5xl font-light font-sans tracking-tighter text-amber-700 dark:text-amber-600 flex items-baseline gap-2">
              {stats.perfectDays} <span className="text-lg text-stone-400 font-medium">days</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. 365 Day Heatmap */}
      <section className="mb-16">
        <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-stone-500 font-bold mb-6 flex items-center gap-4">
          365 Day Heatmap
          <div className="flex-1 h-px bg-stone-200/50 dark:bg-stone-800/50"></div>
        </h2>
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800/50 shadow-sm overflow-hidden">
          <JourneyHeatmap data={stats.heatmapData} />
        </div>
      </section>

      {/* 5. Habit Rankings */}
      <section className="mb-16">
        <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-stone-500 font-bold mb-6 flex items-center gap-4">
          Habit Rankings
          <div className="flex-1 h-px bg-stone-200/50 dark:bg-stone-800/50"></div>
        </h2>
        {stats.habitBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.habitBreakdown.map(habit => (
              <HabitStatsCard 
                key={habit.id}
                name={habit.name}
                color={habit.color}
                iconId={habit.iconId}
                currentStreak={habit.currentStreak}
                bestStreak={habit.bestStreak}
                totalCompletions={habit.totalCompletions}
                completionRate={habit.completionRate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
            No active habits to analyze yet.
          </div>
        )}
      </section>

      {/* 6. Achievements (Placeholder) */}
      <section className="mb-16 opacity-50">
        <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-stone-500 font-bold mb-6 flex items-center gap-4">
          Achievements
          <div className="flex-1 h-px bg-stone-200/50 dark:bg-stone-800/50"></div>
        </h2>
        <div className="p-8 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 flex flex-col items-center justify-center text-center">
          <Award className="text-stone-400 mb-2" size={24} />
          <p className="text-sm font-medium text-stone-500">Milestones and badges coming soon.</p>
        </div>
      </section>

      {/* 7. Weekly Reviews (Placeholder) */}
      <section className="mb-16 opacity-50">
        <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-stone-500 font-bold mb-6 flex items-center gap-4">
          Weekly Reviews
          <div className="flex-1 h-px bg-stone-200/50 dark:bg-stone-800/50"></div>
        </h2>
        <div className="p-8 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 flex flex-col items-center justify-center text-center">
          <CalendarDays className="text-stone-400 mb-2" size={24} />
          <p className="text-sm font-medium text-stone-500">Weekly summaries and insights coming soon.</p>
        </div>
      </section>

    </main>
  );
}
