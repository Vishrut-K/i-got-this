"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center animate-fade-up">
      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={24} strokeWidth={2} />
      </div>
      <h2 className="text-xl font-serif font-medium text-stone-900 dark:text-stone-100 mb-2">
        Something went wrong!
      </h2>
      <p className="text-sm text-stone-500 max-w-sm mb-8">
        We encountered an error loading this section. You can try recovering the page.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:bg-stone-800 dark:hover:bg-white transition-colors"
      >
        <RefreshCcw size={14} />
        Try again
      </button>
    </div>
  );
}
