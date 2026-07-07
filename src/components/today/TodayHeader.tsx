"use client";

import { useState, useEffect, useTransition } from "react";
import { updateUserName } from "@/server/actions";
import { useToast } from "@/contexts/ToastContext";

export default function TodayHeader({ name }: { name: string | null }) {
  const [time, setTime] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name ? name.split(" ")[0] : "Friend");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

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

  const handleRename = () => {
    if (!editName.trim() || editName.trim() === firstName) {
      setIsEditing(false);
      setEditName(firstName);
      return;
    }
    const newName = editName.trim();
    setIsEditing(false);

    startTransition(async () => {
      try {
        await updateUserName(newName);
      } catch (err: any) {
        toast.error("Failed to update name.");
        setEditName(firstName);
      }
    });
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-baseline mb-2 mt-1">
      <h1 className="text-2xl font-serif text-stone-900 dark:text-stone-100 tracking-tight flex items-baseline gap-1">
        <span>{greeting},</span>
        {isEditing ? (
          <input 
            type="text"
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditName(firstName);
              }
            }}
            className="bg-transparent border-b border-stone-400 dark:border-stone-600 outline-none w-32"
          />
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="hover:text-stone-500 dark:hover:text-stone-300 transition-colors border-b border-transparent hover:border-stone-300 dark:hover:border-stone-600 outline-none"
            title="Edit Name"
          >
            {editName} {/* Use editName for optimistic update display */}
          </button>
        )}
      </h1>
      
      {/* 2. Sleek minimal clock */}
      <div className="text-xs font-sans tracking-[0.2em] text-stone-400 uppercase mt-1 md:mt-0">
        {time}
      </div>
    </header>
  );
}
