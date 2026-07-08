"use client";

import { useState, useEffect } from "react";
import { getRandomQuote, Quote } from "@/lib/quotes/quotes";

export default function QuoteSection() {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuote(getRandomQuote());
  }, []);

  if (!quote) return null;

  return (
    <section>
      <h2 className="text-[10px] tracking-widest uppercase text-stone-400 mb-4 font-semibold">
        Thought of the Day
      </h2>
      <div className="pl-4 border-l-2 border-stone-300 dark:border-stone-700">
        <p className="font-serif italic text-[15px] text-stone-700 dark:text-stone-300 leading-relaxed mb-2">
          &quot;{quote.text}&quot;
        </p>
        <p className="text-[10px] font-sans tracking-widest uppercase text-stone-400 font-medium">
          — {quote.author}
        </p>
      </div>
    </section>
  );
}
