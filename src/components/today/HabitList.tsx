"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addHabit, toggleHabitStatus, archiveHabit } from "@/server/actions";
import { ICONS, IconId, COLORS, ColorId } from "@/lib/constants";
import { Plus } from "lucide-react";
import { calculateStreaks } from "@/lib/progress";

type Habit = { id: string; name: string; iconId: string; color: string; archivedAt: Date | null };
type HabitLog = { habitId: string; status: string; date: string };

export default function HabitList({
  habits, allLogs, last7Days
}: {
  habits: Habit[], allLogs: HabitLog[], last7Days: string[]
}) {
  const router = useRouter();
  const [newHabitName, setNewHabitName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const activeHabits = habits.filter(h => !h.archivedAt);
  const todayStr = last7Days[6];

  const getStatus = (habitId: string, date: string) => {
    return allLogs.find((l) => l.habitId === habitId && l.date === date)?.status || "EMPTY";
  };

  const handleToggleToday = async (habitId: string) => {
    if (isPending) return;
    const current = getStatus(habitId, todayStr);
    let next = "DONE";
    if (current === "DONE") next = "SKIP";
    if (current === "SKIP") next = "EMPTY";

    setAnimatingId(habitId);
    setTimeout(() => setAnimatingId(null), 200); 

    setErrorMessage("");
    startTransition(async () => {
      try {
        await toggleHabitStatus(habitId, todayStr, next);
        router.refresh();
      } catch {
        setErrorMessage("That change did not save. Please try again.");
      }
    });
  };

  const handleAdd = async () => {
    if (!newHabitName.trim()) return;
    setIsAdding(true);
    setErrorMessage("");
    try {
      await addHabit(newHabitName.trim(), "activity", "stone");
      setNewHabitName("");
      setShowAddInput(false);
      router.refresh();
    } catch {
      setErrorMessage("Your habit could not be saved. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleArchive = (habitId: string) => {
    if (isPending) return;
    setErrorMessage("");
    startTransition(async () => {
      try {
        await archiveHabit(habitId);
        router.refresh();
      } catch {
        setErrorMessage("That habit could not be archived. Please try again.");
      }
    });
  };

  const dayNames = last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0));

  return (
    <div className="space-y-1">
      {activeHabits.length === 0 && !showAddInput && (
        <div className="text-stone-500 italic py-4">
          Start with one quiet commitment. You can always adjust it later.
        </div>
      )}

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Grid Header (Invisible on mobile, aligned on desktop) */}
      {activeHabits.length > 0 && (
        <div className="hidden md:grid grid-cols-12 gap-4 pb-2 text-[10px] font-medium tracking-widest text-stone-400 relative">
          <div className="col-span-4 uppercase">Habit</div>
          <div className="col-span-6 grid grid-cols-7 justify-items-center items-center">
            {dayNames.map((day, i) => (
              <span key={i} className={i === 6 ? "text-stone-800 dark:text-stone-200 font-bold" : ""}>
                {i === 6 ? "TODAY" : day}
              </span>
            ))}
          </div>
          <div className="col-span-2 text-right uppercase pr-4">Streak</div>
        </div>
      )}

      {activeHabits.map((habit) => {
        const todayStatus = getStatus(habit.id, todayStr);
        const isAnimating = animatingId === habit.id;
        const IconComponent = ICONS[habit.iconId as IconId] || ICONS.activity;
        const colorClass = COLORS[habit.color as ColorId] || COLORS.stone;
        
        // Progress Engine Math
        const { currentStreak } = calculateStreaks(habit.id, allLogs, todayStr);
        
        return (
          <div key={habit.id} className="relative group">
            {/* The main habit row */}
            <div 
              className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 py-1.5 border-b border-stone-200/50 dark:border-stone-800/50 transition-all duration-500 ease-out hover:bg-stone-100/30 dark:hover:bg-stone-800/30 -mx-4 px-4 rounded-xl"
            >
              
              {/* 1. Left: Icon and Name */}
              <div className={`col-span-4 flex items-center gap-2.5 transition-colors ${todayStatus === "SKIP" ? "opacity-30" : ""}`}>
                <div className={`p-1 rounded-md ${colorClass}`}>
                  <IconComponent size={16} strokeWidth={2.5} />
                </div>
                <span className={`text-lg font-serif tracking-wide truncate ${todayStatus === "SKIP" ? "line-through decoration-stone-300" : "text-stone-800 dark:text-stone-200"}`}>
                  {habit.name}
                </span>
              </div>
              
              {/* 2. Middle: The 7-Day Timeline with Inline Checkbox */}
              <div className="col-span-6 grid grid-cols-7 justify-items-center items-center">
                {last7Days.map((dateStr, idx) => {
                  const status = getStatus(habit.id, dateStr);
                  const isToday = idx === 6;
                  
                  if (isToday) {
                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleToggleToday(habit.id)}
                        disabled={isPending}
                        aria-label={`Toggle habit ${habit.name} for today`}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-200 border-2
                          ${isAnimating ? "scale-125" : "scale-100"} 
                          ${todayStatus === "DONE" ? "bg-[#4A6750] border-[#4A6750] text-[#F9F7F1] dark:bg-[#5C7E63] dark:border-[#5C7E63]" : ""}
                          ${todayStatus === "SKIP" ? "bg-transparent border-stone-300 text-stone-400 dark:border-stone-600 dark:text-stone-500" : ""}
                          ${todayStatus === "EMPTY" ? "border-[#A96455]/40 hover:border-[#A96455]/70 bg-transparent text-transparent dark:border-[#A96455]/50 dark:hover:border-[#A96455]/80" : ""}
                        `}
                      >
                        {todayStatus === "DONE" && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                        {todayStatus === "SKIP" && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>}
                      </button>
                    );
                  } else {
                    return (
                      <div 
                        key={dateStr}
                        className={`w-3.5 h-3.5 rounded-sm border ${
                          status === "DONE" ? "bg-[#4A6750] border-[#4A6750] dark:bg-[#5C7E63] dark:border-[#5C7E63]" : 
                          status === "SKIP" ? "bg-stone-200 border-stone-200 dark:bg-stone-800 dark:border-stone-800 opacity-50" : 
                          "bg-transparent border-[#A96455]/30 dark:border-[#A96455]/30"
                        }`} 
                      />
                    );
                  }
                })}
              </div>

              {/* 3. Right: Streak & Actions */}
              <div className="col-span-2 flex items-center justify-end gap-4 pr-4">
                <button 
                  onClick={() => handleArchive(habit.id)}
                  disabled={isPending}
                  aria-label={`Archive habit ${habit.name}`}
                  className="text-xs font-sans uppercase tracking-widest text-stone-400 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:text-red-500 disabled:opacity-30"
                >
                  Archive
                </button>
                <div className="flex items-center gap-1.5 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
                  <span className="text-sm">🔥</span>
                  <span className="font-medium text-sm tracking-widest uppercase">{currentStreak}</span>
                </div>
              </div>
            </div>

          </div>
        );
      })}

      {/* Add Habit Input */}
      <div className="pt-6">
        {!showAddInput ? (
          <button 
            onClick={() => setShowAddInput(true)}
            className="flex min-h-11 items-center gap-3 text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 transition-colors py-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/60 rounded-md"
          >
            <Plus size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-sans font-medium text-sm tracking-widest uppercase">Add Habit</span>
          </button>
        ) : (
          <div className="flex items-center gap-4 py-2">
            <input
              type="text"
              autoFocus
              placeholder="E.g. Morning meditation..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setShowAddInput(false);
              }}
              className="flex-1 bg-transparent border-b-2 border-stone-800 dark:border-stone-200 outline-none font-serif text-xl text-stone-800 dark:text-stone-200 placeholder:text-stone-400 italic focus:ring-0 p-1 transition-all"
            />
            <button 
              onClick={handleAdd}
              disabled={isAdding || !newHabitName.trim()}
              className="text-sm font-sans tracking-widest uppercase font-medium text-stone-800 dark:text-stone-200 disabled:opacity-30 transition-colors"
            >
              {isAdding ? "Saving" : "Save"}
            </button>
            <button 
              onClick={() => setShowAddInput(false)}
              className="text-sm font-sans tracking-widest uppercase font-medium text-stone-400 hover:text-stone-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
