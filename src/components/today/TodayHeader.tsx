"use client";

import { useState, useEffect } from "react";

export default function TodayHeader({ name }: { name: string | null }) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    // 1. Set the live clock
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  const firstName = name ? name.split(" ")[0] : "Friend";

  return (
    <header className="flex flex-col md:flex-row justify-between items-baseline mb-2 mt-1">
      <h1 className="text-2xl font-serif text-stone-900 dark:text-stone-100 tracking-tight">
        {greeting}, {firstName}
      </h1>
      
      {/* 2. Sleek minimal clock */}
      <div className="text-xs font-sans tracking-[0.2em] text-stone-400 uppercase mt-1 md:mt-0">
        {time}
      </div>
    </header>
  );
}