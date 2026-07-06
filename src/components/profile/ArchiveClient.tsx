"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { restoreHabit, deleteHabitForever } from "@/server/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

export default function ArchiveClient({ initialHabits }: { initialHabits: any[] }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  const handleRestore = async (id: string) => {
    setIsProcessing(id);
    await restoreHabit(id);
    router.refresh();
    setIsProcessing(null);
  };

  const handleDelete = async (id: string) => {
    toast.confirm(
      "Are you sure you want to permanently delete this habit and all its history?",
      async () => {
        setIsProcessing(id);
        await deleteHabitForever(id);
        router.refresh();
        setIsProcessing(null);
      }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {initialHabits.map((habit) => {
        const Icon = (Icons as any)[habit.iconId] || Icons.Circle;
        const archivedDate = new Date(habit.archivedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        return (
          <div key={habit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 gap-6">
            
            {/* Identity */}
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center opacity-70 grayscale"
                style={{ backgroundColor: habit.color, color: 'white' }}
              >
                <Icon size={24} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-stone-700 dark:text-stone-300">
                  {habit.name}
                </span>
                <span className="text-xs text-stone-500">
                  Archived {archivedDate} • Completed {habit._count?.logs || 0} Times
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleRestore(habit.id)}
                disabled={isProcessing === habit.id}
                className="px-4 py-2 bg-stone-800 dark:bg-stone-200 text-stone-100 dark:text-stone-800 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Restore
              </button>
              <button 
                onClick={() => handleDelete(habit.id)}
                disabled={isProcessing === habit.id}
                className="px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Delete Forever
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
}
