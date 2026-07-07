"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { LogIn, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

export default function LandingPage() {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleStartAnonymous = async () => {
    setIsStarting(true);
    try {
      const { error } = await signIn.anonymous();
      if (error) {
        throw new Error(error.message || "Failed to start session");
      }
      // Successful anonymous login, redirect to dashboard by refreshing the page
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center px-6 animate-fade-in-up relative z-10">
      
      {/* Subtle Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500 bg-stone-200/50 dark:bg-stone-800/50 rounded-full">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A6750] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A6750]"></span>
        </span>
        Local First. Privacy Focused.
      </div>

      <h1 className="text-5xl md:text-7xl font-serif text-stone-800 dark:text-stone-200 tracking-tight leading-tight mb-6 max-w-2xl">
        Master your habits.<br />
        <span className="italic text-stone-400 dark:text-stone-500 font-light">Quiet the noise.</span>
      </h1>
      
      <p className="text-stone-500 dark:text-stone-400 text-lg md:text-xl font-sans font-light max-w-xl mx-auto mb-12 leading-relaxed">
        A calm operating system for daily momentum. No setup required. Start tracking instantly and sync when you&apos;re ready.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
        <button
          onClick={handleStartAnonymous}
          disabled={isStarting}
          className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-theme-accent text-white hover:opacity-90 rounded-lg text-sm font-semibold tracking-wider uppercase transition-all overflow-hidden"
        >
          {isStarting ? (
            <div className="w-5 h-5 border-2 border-stone-400 border-t-white dark:border-stone-400 dark:border-t-stone-800 rounded-full animate-spin"></div>
          ) : (
            <>
              Start Tracking
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <Link
          href="/login"
          className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-stone-200/50 dark:hover:bg-stone-800/50 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 rounded-lg text-sm font-semibold tracking-wider uppercase transition-colors"
        >
          Log In
          <LogIn className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

    </div>
  );
}
