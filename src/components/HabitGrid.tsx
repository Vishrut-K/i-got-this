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
  const isProductiveDay = percentage >= 70;

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans">
      <div className="mb-8 border-b pb-4">
        <div className="flex justify-between items-end mb-2">
          <h1 className="text-3xl font-bold">Today's Progress</h1>
          <span className={`text-xl font-semibold ${isProductiveDay ? "text-green-500" : "text-blue-500"}`}>
            {percentage}%
          </span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 mb-4 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${isProductiveDay ? "bg-green-500" : "bg-blue-600"}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-zinc-500 italic">"The secret of your future is hidden in your daily routine."</p>
          <button 
            onClick={handleClearAll}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Clear All Progress
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Add a new habit..." 
          className="flex-1 p-2 border rounded-md dark:bg-black dark:border-zinc-800"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
        />
        <button 
          onClick={handleAddHabit}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-medium rounded-md"
        >
          Add
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {habits.map((habit) => (
          <div key={habit.id} className="flex justify-between items-center p-4 border rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => handleDeleteHabit(habit.id)} className="text-zinc-400 hover:text-red-500 font-bold" title="Delete Habit">
                ✕
              </button>
              <span className="font-medium text-lg">{habit.name}</span>
            </div>
            <div className="flex gap-2">
               {dynamicDays.map((day) => {
                  const status = logs[`${habit.id}-${day.dateKey}`] || "EMPTY"; 
                  let circleColor = "border-zinc-700 hover:bg-zinc-800"; 
                  if (status === "DONE") circleColor = "bg-blue-600 border-blue-600";
                  if (status === "SKIP") circleColor = "bg-zinc-500 border-zinc-500";

                  return (
                    <div key={day.dateKey} className="flex flex-col items-center gap-1">
                        <span className="text-xs text-zinc-500">{day.label}</span>
                        <div 
                          onClick={() => toggleStatus(habit.id, day.dateKey)}
                          className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-colors ${circleColor}`}
                          title={day.dateKey}
                        ></div>
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