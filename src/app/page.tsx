"use client"; // This tells Next.js this page uses interactive React features
import { useState } from "react";



export default function Home() {
    // This scoreboard remembers clicks. Example: { "1-Mon": "DONE", "1-Tue": "SKIP" }
  const [logs, setLogs] = useState<Record<string, string>>({});
  const toggleStatus = (habitId: number, day: string) => {
    const key = `${habitId}-${day}`; // Create a unique ID for this specific circle
    const currentStatus = logs[key];
    // Cycle through the statuses
    let newStatus = "DONE";
    if (currentStatus === "DONE") newStatus = "SKIP";
    if (currentStatus === "SKIP") newStatus = "EMPTY";
    // Update the scoreboard!
    setLogs({ ...logs, [key]: newStatus });
  };

  // 1. This is our "Array" (our box of potatoes)
  const fakeHabits = [
    { id: 1, name: "Drink Water" },
    { id: 2, name: "Read 10 pages" },
    { id: 3, name: "Meditate" }
  ];
  const pastFiveDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // 1. Get a list of just the "Fri" keys from our scoreboard
// Object.keys(logs) gives us an array like ["1-Mon", "1-Fri", "2-Fri"]
const fridays = Object.keys(logs).filter((key) => key.endsWith("-Fri"));

// 2. Filter again to only keep the ones marked "DONE"
const completedFridays = fridays.filter((key) => logs[key] === "DONE");

// 3. Do some math!
const totalHabits = fakeHabits.length;
const completedCount = completedFridays.length;
const percentage = totalHabits === 0 ? 0 : Math.round((completedCount / totalHabits) * 100);
const isProductiveDay = percentage >= 70;

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="mb-8 border-b pb-4">
        <div className="flex justify-between items-end mb-2">
  <h1 className="text-3xl font-bold">Today's Progress</h1>
  <span className={`text-xl font-semibold ${isProductiveDay ? "text-green-500" : "text-blue-500"}`}>
    {percentage}%
  </span>
</div>

{/* This is the visual progress bar! */}
<div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 mb-4 overflow-hidden">
  <div 
    className={`h-2.5 rounded-full transition-all duration-500 ${isProductiveDay ? "bg-green-500" : "bg-blue-600"}`} 
    style={{ width: `${percentage}%` }}
  ></div>
</div>
        <p className="text-zinc-500 italic">"The secret of your future is hidden in your daily routine."</p>
      </div>

      {/* HABITS GRID */}
      <div className="flex flex-col gap-4">
        
        {/* 2. Here is our .map() machine making HTML for each habit! */}
        {fakeHabits.map((habit) => (
          <div key={habit.id} className="flex justify-between items-center p-4 border rounded-lg shadow-sm">
            <span className="font-medium text-lg">{habit.name}</span>
            <div className="flex gap-2">
               {/* We will build the 7-day checkboxes here later! */}
               {pastFiveDays.map((day) => {
   const status = logs[`${habit.id}-${day}`] || "EMPTY"; // Check the scoreboard
   
   // Pick a color based on status
   let circleColor = "border-zinc-700 hover:bg-zinc-800"; // Default Empty
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