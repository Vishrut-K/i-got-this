"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { updateUserName } from "@/server/actions";
import { useToast } from "@/contexts/ToastContext";

export default function ProfileIdentity({ user, memberSince }: { user: { name: string | null, email: string | null, image: string | null }, memberSince: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name || "");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const handleSave = () => {
    if (!newName.trim() || newName.trim() === user.name) {
      setIsEditing(false);
      return;
    }
    startTransition(async () => {
      try {
        await updateUserName(newName.trim());
        toast.success("Username updated");
        setIsEditing(false);
      } catch {
        toast.error("Failed to update username");
      }
    });
  };

  return (
    <section className="flex flex-col items-center mb-16 relative">
      <div className="w-20 h-20 rounded-full bg-stone-200 dark:bg-stone-800 mb-4 flex items-center justify-center overflow-hidden">
        {user.image ? (
          <Image src={user.image} alt={user.name || "Avatar"} width={80} height={80} className="w-full h-full object-cover" unoptimized />
        ) : (
          <span className="text-2xl font-serif text-stone-500">
            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-1 group relative">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
              onBlur={handleSave}
              disabled={isPending}
              className="text-2xl font-serif font-bold text-center text-stone-900 dark:text-stone-100 bg-transparent border-b border-stone-300 dark:border-stone-700 focus:outline-none w-48 disabled:opacity-50"
            />
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">{user.name || "Anonymous"}</h2>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute -right-6 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              aria-label="Edit username"
            >
              <Pencil size={14} />
            </button>
          </>
        )}
      </div>

      <p className="text-sm text-stone-500 mb-1">{user.email}</p>
      <p className="text-xs text-stone-400">Member Since {memberSince}</p>
    </section>
  );
}
