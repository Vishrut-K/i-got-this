import { Dumbbell, BookOpen, Droplets, Brain, Moon, Leaf, Activity, Coffee, PenTool } from "lucide-react";

// Threshold for a day to be considered "Productive"
export const PRODUCTIVE_THRESHOLD = 70;

// The single source of truth for Habit Icons
export const ICONS = {
  dumbbell: Dumbbell,
  book: BookOpen,
  droplets: Droplets,
  brain: Brain,
  moon: Moon,
  leaf: Leaf,
  activity: Activity,
  coffee: Coffee,
  pen: PenTool,
} as const;

export type IconId = keyof typeof ICONS;

// The single source of truth for Habit Colors (Tailwind classes)
export const COLORS = {
  stone: "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200",
  olive: "bg-[#7A8B76] text-white",
  sand:  "bg-[#D9CDBF] text-stone-900",
  clay:  "bg-[#B38D82] text-white",
  slate: "bg-[#707D85] text-white",
} as const;

export type ColorId = keyof typeof COLORS;
