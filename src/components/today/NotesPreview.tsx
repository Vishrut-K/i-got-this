import Link from "next/link";

export default function NotesPreview({ yesterdayContent }: { yesterdayContent: string | null }) {
  // Extract a small snippet from yesterday's journal if it exists
  const previewText = yesterdayContent 
    ? (yesterdayContent.length > 80 ? yesterdayContent.substring(0, 80) + "..." : yesterdayContent)
    : "A blank page isn't empty. It's waiting.";

  return (
    <div className="group border-l-2 border-stone-200 dark:border-stone-800 pl-4 py-1 hover:border-stone-400 dark:hover:border-stone-600 transition-colors">
      <Link href="/journal" className="block outline-none">
        
        {yesterdayContent && (
          <div className="text-xs font-sans tracking-widest text-stone-400 uppercase mb-2">
            Yesterday:
          </div>
        )}
        
        <p className="font-serif text-xl text-stone-700 dark:text-stone-300 italic mb-4 leading-relaxed">
          "{previewText}"
        </p>
        
        <div className="text-sm font-sans font-medium text-stone-400 uppercase tracking-widest flex items-center gap-2 group-hover:text-stone-800 dark:group-hover:text-stone-200 group-hover:gap-3 transition-all">
          Continue writing <span>→</span>
        </div>
      </Link>
    </div>
  );
}
