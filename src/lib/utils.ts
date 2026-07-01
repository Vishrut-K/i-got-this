/**
 * ARCHITECTURE DECISION:
 * - Why it exists: Provides a centralized place for commonly used utility functions. Specifically, the `cn` function is essential for merging Tailwind CSS classes conditionally without style conflicts.
 * - Why this structure scales well: As the application grows, generic helpers (like formatting dates, parsing strings) can be added here or in adjacent files within `lib/`, keeping component files clean and focused on UI logic.
 * - Tradeoffs: Using an external library (`tailwind-merge`) adds a small footprint, but it eliminates a major source of styling bugs with Tailwind components.
 * - Avoiding beginner mistakes: Beginners often use string concatenation for Tailwind classes, which can lead to unpredictable specificity issues (e.g., `p-4 p-8` where the outcome depends on the CSS bundle order). `cn` safely merges these, ensuring predictable styles.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
