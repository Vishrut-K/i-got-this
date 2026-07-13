"use client";

import { useState, useTransition, useOptimistic } from "react";

import { addHabit, toggleHabitStatus, archiveHabit, updateHabitName } from "@/server/actions";
import { ICONS, IconId, COLORS, ColorId } from "@/lib/constants";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Plus, Edit2, Trash2, MoreVertical } from "lucide-react";
import { calculateStreaks, calculateTodayProgress } from "@/lib/progress";
import TodayStats from "./TodayStats";

type Habit = { id: string; name: string; iconId: string; color: string; archivedAt: Date | null };
type HabitLog = { habitId: string; status: string; date: string };

export default function HabitList({
  habits, allLogs, last7Days
}: {
  habits: Habit[], allLogs: HabitLog[], last7Days: string[]
}) {

  const [newHabitName, setNewHabitName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newHabitIcon, setNewHabitIcon] = useState("✨");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editHabitName, setEditHabitName] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [optimisticHabits, addOptimisticHabit] = useOptimistic(
    habits,
    (state, action: { type: 'ADD', habit: Habit } | { type: 'ARCHIVE', id: string } | { type: 'UPDATE_NAME', id: string, name: string }) => {
      if (action.type === 'ADD') {
        return [...state, action.habit];
      }
      if (action.type === 'ARCHIVE') {
        return state.map(h => h.id === action.id ? { ...h, archivedAt: new Date() } : h);
      }
      if (action.type === 'UPDATE_NAME') {
        return state.map(h => h.id === action.id ? { ...h, name: action.name } : h);
      }
      return state;
    }
  );

  const [optimisticLogs, addOptimisticLog] = useOptimistic(
    allLogs,
    (state, action: { type: 'UPDATE', log: HabitLog }) => {
      if (action.type === 'UPDATE') {
        const existing = state.findIndex(l => l.habitId === action.log.habitId && l.date === action.log.date);
        if (existing >= 0) {
          const nextState = [...state];
          nextState[existing] = action.log;
          return nextState;
        }
        return [...state, action.log];
      }
      return state;
    }
  );

  const activeHabits = optimisticHabits.filter(h => !h.archivedAt);
  const todayStr = last7Days[last7Days.length  - 1]; 

  const getStatus = (habitId: string, date: string) => {
    return optimisticLogs.find((l) => l.habitId === habitId && l.date === date)?.status || "EMPTY";
  };

  const handleToggleToday = async (habitId: string) => {
    const current = getStatus(habitId, todayStr);
    let next = "DONE";
    if (current === "DONE") next = "SKIP";
    if (current === "SKIP") next = "EMPTY";

    setAnimatingId(habitId);
    setTimeout(() => setAnimatingId(null), 200); 

    setErrorMessage("");
    
    startTransition(async () => {
      // Immediately update UI optimistically inside transition
      addOptimisticLog({ type: 'UPDATE', log: { habitId, date: todayStr, status: next } });

      try {
        await toggleHabitStatus(habitId, todayStr, next);
        // Server action calls revalidatePath, which will sync real state automatically
      } catch {
        setErrorMessage("That change did not save. Please try again.");
      }
    });
  };

  const handleAdd = async () => {
    if (!newHabitName.trim()) return;
    const nameToSave = newHabitName.trim();
    setIsAdding(true);
    setErrorMessage("");

    setNewHabitName("");
    setShowAddInput(false);

    startTransition(async () => {
      // Optimistically add to UI
      addOptimisticHabit({ 
        type: 'ADD', 
        habit: { id: `temp-${Date.now()}`, name: nameToSave, iconId: newHabitIcon, color: "stone", archivedAt: null } 
      });

      try {
        await addHabit(nameToSave, newHabitIcon, "stone");
      } catch {
        setErrorMessage("Your habit could not be saved. Please try again.");
      } finally {
        setIsAdding(false);
      }
    });
  };

  const handleArchive = (habitId: string) => {
    setErrorMessage("");
    
    startTransition(async () => {
      // Optimistically remove from UI
      addOptimisticHabit({ type: 'ARCHIVE', id: habitId });

      try {
        await archiveHabit(habitId);
      } catch {
        setErrorMessage("That habit could not be archived. Please try again.");
      }
    });
  };

  const handleRename = (habitId: string) => {
    if (!editHabitName.trim()) {
      setEditingHabitId(null);
      return;
    }
    const nameToSave = editHabitName.trim();
    setErrorMessage("");

    startTransition(async () => {
      addOptimisticHabit({ type: 'UPDATE_NAME', id: habitId, name: nameToSave });
      setEditingHabitId(null);
      
      try {
        await updateHabitName(habitId, nameToSave);
      } catch {
        setErrorMessage("Could not rename habit. Please try again.");
      }
    });
  };

  const dayData = last7Days.map(d => {
    const [year, month, day] = d.split('-');
    const localDate = new Date(Number(year), Number(month) - 1, Number(day));
    return {
      char: localDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      num: localDate.getDate()
    };
  });

  const todayLogs = optimisticLogs.filter(l => l.date === todayStr);
  const { doneCount, eligibleHabitsCount, percentage } = calculateTodayProgress(activeHabits, todayLogs);

  return (
    <div className="space-y-1">
      <section className="mb-8">
        <TodayStats 
          completedCount={doneCount} 
          totalCount={eligibleHabitsCount} 
          percentageOverride={percentage}
        />
      </section>

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

      {/* Spreadsheet Table Container */}
      {activeHabits.length > 0 && (
        <div className="border border-stone-200/60 dark:border-stone-800/60 rounded-xl overflow-hidden shadow-sm bg-white/30 dark:bg-[#1A1A18]/30 mb-2">
          
          {/* Grid Header */}
          <div className="grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 py-3 text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-400 border-b border-stone-200/60 dark:border-stone-800/60 bg-stone-50/80 dark:bg-stone-900/40">
            <div className="col-span-6 md:col-span-4">Habit</div>
            
            {/* 7-Days Header (Desktop shows 7, Mobile shows 3) */}
            <div className="col-span-4 md:col-span-6 grid grid-cols-3 md:grid-cols-7 justify-items-center">
              {dayData.map((day, i) => {
                const isMobileVisible = i >= 4;
                return (
                  <div key={i} className={`flex-col items-center leading-tight gap-0.5 ${i === 6 ? "text-stone-800 dark:text-stone-200" : ""} ${isMobileVisible ? "flex" : "hidden md:flex"}`}>
                    {i === 6 ? (
                      <>
                        <span className="font-bold">TOD</span>
                        <span className="text-[9px] font-semibold">{day.num}</span>
                      </>
                    ) : (
                      <>
                        <span>{day.char}</span>
                        <span className="text-[9px] opacity-70">{day.num}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="col-span-2 text-right">Streak</div>
          </div>
          
          {/* Rows Container */}
          <div className="divide-y divide-stone-200/40 dark:divide-stone-800/40 flex flex-col">
            {activeHabits.map((habit) => {
        const todayStatus = getStatus(habit.id, todayStr);
        const isAnimating = animatingId === habit.id;
        const IconComponent = ICONS[habit.iconId as IconId];
        const colorClass = COLORS[habit.color as ColorId] || COLORS.stone;
        
        // Progress Engine Math
        const { currentStreak } = calculateStreaks(habit.id, optimisticLogs, todayStr);
        
        return (
          <div key={habit.id} className="relative group">
            <div className="grid grid-cols-12 items-center gap-2 sm:gap-4 py-3 px-3 sm:px-4 hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors duration-200">
              
              {/* Left: Icon and Name */}
              <div className={`col-span-6 md:col-span-4 flex items-center gap-3 shrink-0 transition-colors ${todayStatus === "SKIP" ? "opacity-40" : ""}`}>
                <div className={`flex p-1.5 rounded-lg ${colorClass} shrink-0 items-center justify-center`}>
                  {IconComponent ? (
                    <IconComponent size={14} strokeWidth={2.5} />
                  ) : (
                    <span className="text-[14px] leading-none">{habit.iconId}</span>
                  )}
                </div>
                {editingHabitId === habit.id ? (
                  <input 
                    type="text"
                    autoFocus
                    value={editHabitName}
                    onChange={(e) => setEditHabitName(e.target.value)}
                    onBlur={() => handleRename(habit.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(habit.id);
                      if (e.key === "Escape") setEditingHabitId(null);
                    }}
                    className="w-full bg-transparent border-b border-stone-400 dark:border-stone-600 outline-none font-serif text-[15px] sm:text-base text-stone-800 dark:text-stone-200"
                  />
                ) : (
                  <span className={`text-[15px] sm:text-base font-serif tracking-wide truncate ${todayStatus === "SKIP" ? "line-through decoration-stone-300 dark:decoration-stone-600" : "text-stone-800 dark:text-stone-200"}`}>
                    {habit.name}
                  </span>
                )}
              </div>
              
              {/* 7-Day Timeline (Desktop shows 7, Mobile shows 3) */}
              <div className="col-span-4 md:col-span-6 grid grid-cols-3 md:grid-cols-7 justify-items-center items-center">
                {last7Days.map((dateStr, idx) => {
                  const status = getStatus(habit.id, dateStr);
                  const isToday = idx === 6;
                  const isMobileVisible = idx >= 4;
                  
                  return (
                    <div key={dateStr} className={`justify-center ${isMobileVisible ? "flex" : "hidden md:flex"}`}>
                      {isToday ? (
                        <button
                          onClick={() => handleToggleToday(habit.id)}
                          aria-label={`Toggle habit ${habit.name} for today`}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-200 border-[1.5px] shadow-sm
                            ${isAnimating ? "scale-110" : "scale-100"} 
                            ${todayStatus === "DONE" ? "bg-[#4A6750] border-[#4A6750] text-white dark:bg-[#5C7E63] dark:border-[#5C7E63]" : ""}
                            ${todayStatus === "SKIP" ? "bg-transparent border-stone-300 text-stone-400 dark:border-stone-600 dark:text-stone-500" : ""}
                            ${todayStatus === "EMPTY" ? "border-[#A96455]/40 hover:border-[#A96455]/70 bg-transparent text-transparent dark:border-[#A96455]/50 dark:hover:border-[#A96455]/80" : ""}
                          `}
                        >
                          {todayStatus === "DONE" && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                          {todayStatus === "SKIP" && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>}
                        </button>
                      ) : (
                        <div 
                          className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors ${
                            status === "DONE" ? "bg-[#4A6750] dark:bg-[#5C7E63]" : 
                            status === "SKIP" ? "bg-stone-200 dark:bg-stone-700" : 
                            "bg-stone-200/50 dark:bg-stone-800"
                          }`} 
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right: Streak & Actions */}
              <div className="col-span-2 flex items-center justify-end gap-1 sm:gap-3 shrink-0 relative">
                
                {/* Desktop Floating Actions on Hover */}
                <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-12 bg-stone-100/90 dark:bg-stone-800/90 backdrop-blur-sm px-1.5 py-1 rounded-md shadow-sm border border-stone-200/50 dark:border-stone-700/50 z-10">
                  <button 
                    onClick={() => {
                      setEditHabitName(habit.name);
                      setEditingHabitId(habit.id);
                    }}
                    className="p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                    title="Edit Habit"
                  >
                    <Edit2 size={14} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => handleArchive(habit.id)}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                    title="Archive Habit"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {activeMenuId === habit.id && (
                  <div className="sm:hidden absolute right-6 top-full mt-1 bg-white dark:bg-stone-800 shadow-lg border border-stone-200 dark:border-stone-700 rounded-md py-1 z-20 flex flex-col min-w-[100px]">
                     <button 
                       onClick={() => { setEditHabitName(habit.name); setEditingHabitId(habit.id); setActiveMenuId(null); }} 
                       className="px-3 py-2 text-left text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2"
                     >
                       <Edit2 size={12}/> Edit
                     </button>
                     <button 
                       onClick={() => { handleArchive(habit.id); setActiveMenuId(null); }} 
                       className="px-3 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2"
                     >
                       <Trash2 size={12}/> Delete
                     </button>
                  </div>
                )}

                {/* Streak */}
                <div className={`flex items-center gap-0.5 sm:gap-1.5 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors ${currentStreak > 0 ? "opacity-100" : "opacity-40"}`}>
                  <span className="text-[12px] sm:text-[14px]">🔥</span>
                  <span className="font-semibold text-[13px] sm:text-[14px] tracking-widest">{currentStreak}</span>
                </div>

                {/* Mobile Menu Toggle Button */}
                <button 
                  className="sm:hidden p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                  onClick={() => setActiveMenuId(activeMenuId === habit.id ? null : habit.id)}
                >
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
          </div>
        );
            })}
          </div>
        </div>
      )}

      {/* Add Habit Input */}
      <div className="pt-6">
        {!showAddInput ? (
          <button 
            onClick={() => setShowAddInput(true)}
            className="flex min-h-11 items-center gap-3 text-theme-accent hover:opacity-80 transition-opacity py-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/60 rounded-md"
          >
            <Plus size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-sans font-medium text-sm tracking-widest uppercase">Add Habit</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4 py-2 relative">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-10 h-10 flex items-center justify-center text-xl bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors shrink-0"
            >
              {newHabitIcon}
            </button>
            
            {showEmojiPicker && (
              <div className="absolute top-12 left-0 z-50 shadow-xl rounded-xl">
                <EmojiPicker 
                  theme={Theme.AUTO} 
                  onEmojiClick={(emoji) => {
                    setNewHabitIcon(emoji.emoji);
                    setShowEmojiPicker(false);
                  }}
                  previewConfig={{ showPreview: false }}
                  skinTonesDisabled
                  height={350}
                  width={300}
                />
              </div>
            )}

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
              className="text-sm font-sans tracking-widest uppercase font-bold text-theme-accent hover:opacity-80 disabled:opacity-30 transition-opacity"
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
