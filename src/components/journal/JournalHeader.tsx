"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search } from "lucide-react";

export default function JournalHeader({ currentDate }: { currentDate: string }) {
  const router = useRouter();

  const handleDateChange = (date: string) => {
    router.push(`/journal?date=${date}`);
  };

  const shiftDate = (days: number) => {
    const d = new Date(currentDate);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    handleDateChange(`${year}-${month}-${day}`);
  };

  const [y, m, d] = currentDate.split("-").map(Number);
  const displayDateObj = new Date(y, m - 1, d);
  const displayDate = displayDateObj.toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  // Check if current date is today
  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const isToday = currentDate === todayStr;

  return (
    <div className="flex items-center justify-between mb-2 py-2 border-b border-stone-200/50 dark:border-stone-800/50 relative z-10">
      
      {/* Date & Today Badge */}
      <div className="flex items-center gap-3">
        <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-stone-500 font-medium">
          {displayDate}
        </h2>
        {isToday && (
          <span className="bg-stone-200/50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded-sm uppercase">
            Today
          </span>
        )}
      </div>

      {/* Navigation & Search */}
      <div className="flex items-center gap-4 text-stone-400 text-xs font-medium tracking-wide">
        
        {/* Date Stepper */}
        <div className="flex items-center gap-1 bg-stone-100/50 dark:bg-stone-900/50 rounded-md px-1 py-1">
          <button onClick={() => shiftDate(-1)} className="flex items-center gap-1 px-2 py-1 hover:bg-white dark:hover:bg-stone-800 rounded transition-colors hover:text-stone-800 dark:hover:text-stone-200 shadow-sm">
            <ChevronLeft size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Yesterday</span>
          </button>
          
          <div className="relative flex items-center justify-center px-1">
            <input 
              type="date" 
              value={currentDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <button className="p-1.5 hover:bg-white dark:hover:bg-stone-800 shadow-sm rounded transition-colors text-stone-500 hover:text-stone-800 dark:hover:text-stone-200">
              <CalendarIcon size={14} strokeWidth={2.5} />
            </button>
          </div>

          <button onClick={() => shiftDate(1)} className="flex items-center gap-1 px-2 py-1 hover:bg-white dark:hover:bg-stone-800 rounded transition-colors hover:text-stone-800 dark:hover:text-stone-200 shadow-sm">
            <span className="hidden sm:inline">Tomorrow</span>
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <button className="flex items-center gap-1.5 p-1.5 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
          <Search size={16} strokeWidth={2.5} />
        </button>

      </div>
    </div>
  );
}
