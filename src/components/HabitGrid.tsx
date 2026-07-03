"use client"; 

import { useState } from "react";
import { addHabit, toggleHabitStatus } from "@/server/actions";

// 1. Notice how we added logs here!
type Habit = {
  id: string;
  name: string;
  logs: { date: string; status: string }[]; 
};

export default function HabitGrid({ habits }: { habits: Habit[] }) {
  // 2. We translate the database logs into our scoreboard format
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

  const toggleStatus = async (habitId: string, day: string) => {
    const key = `${habitId}-${day}`; 
    const currentStatus = logs[key];

    let newStatus = "DONE";
    if (currentStatus === "DONE") newStatus = "SKIP";
    if (currentStatus === "SKIP") newStatus = "EMPTY";

    // Update UI instantly
    setLogs({ ...logs, [key]: newStatus });

    // 3. THIS IS WHAT YOU WERE MISSING! Secretly send to database!
    await toggleHabitStatus(habitId, day, newStatus);
  };

  const pastFiveDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const fridays = Object.keys(logs).filter((key) => key.endsWith("-Fri"));
  const completedFridays = fridays.filter((key) => logs[key] === "DONE");
  const totalHabits = habits.length;
  const completedCount = completedFridays.length;
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
        <p className="text-zinc-500 italic">"The secret of your future is hidden in your daily routine."</p>
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
            <span className="font-medium text-lg">{habit.name}</span>
            <div className="flex gap-2">
               {pastFiveDays.map((day) => {
                  const status = logs[`${habit.id}-${day}`] || "EMPTY"; 
                  let circleColor = "border-zinc-700 hover:bg-zinc-800"; 
                  if (status === "DONE") circleColor = "bg-blue-600 border-blue-600";
                  if (status === "SKIP") circleColor = "bg-zinc-500 border-zinc-500";

                  return (
                    <div key={day} className="flex flex-col items-center gap-1">
                        <span className="text-xs text-zinc-500">{day}</span>
                        <div 
                          onClick={() => toggleStatus(habit.id, day)}
                          className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-colors ${circleColor}`}
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