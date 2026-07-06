import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-transparent z-50 overflow-hidden px-6">
      <main className="w-full max-w-[380px] flex flex-col items-center z-10 pt-4 pb-12 animate-fade-up">
        
        {/* Minimal 404 Graphic */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="text-[120px] font-sans font-light tracking-tighter text-stone-200 dark:text-stone-800 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-stone-900 dark:text-stone-100">
            <span className="text-[18px] font-serif italic font-medium bg-background px-4">
              lost
            </span>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-10">
          <h1 className="text-[20px] font-serif tracking-tight text-stone-900 dark:text-stone-100 mb-2">
            Page not found
          </h1>
          <p className="text-[14px] text-stone-500 max-w-[280px] mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action */}
        <Link 
          href="/"
          className="group flex items-center justify-center gap-2 h-11 px-6 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-[10px] font-medium text-[14px] hover:bg-stone-800 dark:hover:bg-white transition-colors shadow-sm"
        >
          <ArrowLeft size={16} className="text-stone-400 group-hover:text-stone-300 dark:text-stone-500 dark:group-hover:text-stone-600 transition-colors" />
          <span>Return Home</span>
        </Link>
        
      </main>
    </div>
  );
}
