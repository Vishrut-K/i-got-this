export type QuoteCategory = "Discipline" | "Reflection" | "Stoicism" | "Action" | "Growth";

export interface Quote {
  text: string;
  author: string;
  category: QuoteCategory;
}

export const quotes: Quote[] = [
  { text: "Small actions become identity.", author: "James Clear", category: "Discipline" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant", category: "Discipline" },
  { text: "A blank page isn't empty. It's waiting.", author: "Unknown", category: "Reflection" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius", category: "Stoicism" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear", category: "Growth" },
  { text: "He who has a why to live for can bear almost any how.", author: "Friedrich Nietzsche", category: "Reflection" },
  { text: "Don't explain your philosophy. Embody it.", author: "Epictetus", category: "Action" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King", category: "Action" },
];

// Helper to get a random quote, optionally by category
export function getRandomQuote(category?: QuoteCategory): Quote {
  const filtered = category ? quotes.filter(q => q.category === category) : quotes;
  if (filtered.length === 0) return quotes[0]; // Fallback
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}
