"use client"; 

import { useState } from "react";
import { addHabit, toggleHabitStatus, deleteHabit, clearAllHabitLogs } from "@/server/actions";

type Habit = {
  id: string;
  name: string;
  logs: { date: string; status: string }[]; 
};

// Generate the last 5 days dynamically based on the user's current day
const generateLastFiveDays = () => {
  const days = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0]; // "YYYY-MM-DD" format for Database
    const label = d.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon" format for UI
    days.push({ dateKey, label });
  }
  return days;
};

export default function HabitGrid({ habits }: { habits: Habit[] }) {
  const dynamicDays = generateLastFiveDays();
  const todayKey = dynamicDays[4].dateKey;

  const initialScoreboard: Record<string, string> = {};
  habits.forEach(habit => {
    if (habit.logs) {
      habit.logs.forEach(log => {
        initialScoreboard[`${habit.id}-${log.date}`] = log.status;
      });
    }
  });

  const [logs, setLogs] = useState<Record<string, string>>(initialScoreboard);
  const [newHabitName, setNewHabitName] = useState("");

  const handleAddHabit = async () => {
    if (!newHabitName) return;
    await addHabit(newHabitName); 
    setNewHabitName(""); 
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (confirm("Are you sure you want to delete this habit and all its progress?")) {
      await deleteHabit(habitId);
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all progress logs? Your habits will stay, but the checkmarks will be wiped so you can start fresh. This cannot be undone.")) {
      await clearAllHabitLogs();
      setLogs({}); // Instantly clear the UI
    }
  };

  const toggleStatus = async (habitId: string, day: string) => {
    const key = `${habitId}-${day}`; 
    const currentStatus = logs[key];

    let newStatus = "DONE";
    if (currentStatus === "DONE") newStatus = "SKIP";
    if (currentStatus === "SKIP") newStatus = "EMPTY";

    setLogs({ ...logs, [key]: newStatus });
    await toggleHabitStatus(habitId, day, newStatus);
  };

  // Calculate today's percentage dynamically
  const todaysLogs = Object.keys(logs).filter((key) => key.endsWith(todayKey));
  const completedToday = todaysLogs.filter((key) => logs[key] === "DONE");
  const totalHabits = habits.length;
  const completedCount = completedToday.length;
  const percentage = totalHabits === 0 ? 0 : Math.round((completedCount / totalHabits) * 100);

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans text-stone-800">
      
      {/* Editorial Header */}
      <div className="mb-12 pb-6 border-b border-stone-300/50">
        <div className="flex justify-between items-end mb-4">
          <h1 className="text-4xl font-serif text-stone-900 tracking-tight">Today's Progress</h1>
          <span className="text-3xl font-serif text-stone-400 italic">
            {percentage}%
          </span>
        </div>
        
        {/* Soft, thin progress bar like a pencil line filling with ink */}
        <div className="w-full bg-stone-200/50 rounded-full h-1 mb-6 overflow-hidden">
          <div 
            className="h-1 rounded-full transition-all duration-1000 ease-out bg-stone-800" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-stone-500 font-serif italic text-lg tracking-wide">"Quietly becoming better every day."</p>
          <button 
            onClick={handleClearAll}
            className="text-xs text-stone-400 hover:text-stone-800 uppercase tracking-widest transition-colors"
          >
            Clear Progress
          </button>
        </div>
      </div>

      {/* Elegant Add Input */}
      <div className="flex gap-4 mb-10">
        <input 
          type="text" 
          placeholder="cultivate a new habit..." 
          className="flex-1 p-4 bg-white/40 backdrop-blur-sm border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all placeholder:text-stone-400 text-stone-700 shadow-sm"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
        />
        <button 
          onClick={handleAddHabit}
          className="px-8 py-4 bg-stone-800 hover:bg-stone-700 text-stone-50 font-medium rounded-xl shadow-md transition-all uppercase tracking-wider text-sm"
        >
          Add
        </button>
      </div>

      {/* Layered Paper Cards */}
      <div className="flex flex-col gap-5">
        {habits.map((habit) => (
          <div key={habit.id} className="flex justify-between items-center p-6 bg-white/60 backdrop-blur-md border border-stone-200/60 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 group">
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleDeleteHabit(habit.id)} 
                className="text-stone-300 hover:text-red-900 transition-colors opacity-0 group-hover:opacity-100" 
                title="Remove Habit"
              >
                ✕
              </button>
              <span className="font-serif text-xl text-stone-800">{habit.name}</span>
            </div>
            
            <div className="flex gap-3">
               {dynamicDays.map((day) => {
                  const status = logs[`${habit.id}-${day.dateKey}`] || "EMPTY"; 
                  
                  // Ink Stamp Styling
                  let circleColor = "border-stone-300 bg-transparent hover:border-stone-400"; // Empty (pencil outline)
                  if (status === "DONE") circleColor = "bg-stone-800 border-stone-800 scale-105 shadow-inner"; // Done (Dark Ink stamp)
                  if (status === "SKIP") circleColor = "bg-stone-200 border-stone-200 text-transparent"; // Skip (Faint mark)

                  return (
                    <div key={day.dateKey} className="flex flex-col items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">{day.label}</span>
                        <div 
                          onClick={() => toggleStatus(habit.id, day.dateKey)}
                          className={`w-10 h-10 rounded-full border-[1.5px] cursor-pointer transition-all duration-300 flex items-center justify-center ${circleColor}`}
                          title={day.dateKey}
                        >
                          {/* Inner dot for 'Done' to make it feel more tactile */}
                          {status === "DONE" && <div className="w-3 h-3 bg-stone-100 rounded-full opacity-50"></div>}
                        </div>
                    </div>
                  );
               })}
            </div>
            
          </div>
        ))}
      </div>
      
    </div>
  );
}