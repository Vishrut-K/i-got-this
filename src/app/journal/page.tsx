import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import JournalHeader from "@/components/journal/JournalHeader";
import JournalEditor from "@/components/journal/JournalEditor";

export default async function JournalPage(
  props: { searchParams: Promise<{ date?: string }> }
) {
  const searchParams = await props.searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/auth/sign-in");
  }

  // Get the date to display (defaults to today)
  let dateStr = searchParams.date;
  if (!dateStr) {
    const today = new Date();
    // Use local date format by adjusting offset manually or just YYYY-MM-DD
    dateStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  }

  // Fetch the entry for this date
  const entry = await prisma.journalEntry.findUnique({
    where: {
      userId_date: { userId: session.user.id, date: dateStr }
    }
  });

  // Fetch habits and logs for today to show at the bottom
  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id, archivedAt: null },
    orderBy: { createdAt: 'asc' }
  });
  
  const logs = await prisma.habitLog.findMany({
    where: {
      habitId: { in: habits.map(h => h.id) },
      date: dateStr
    }
  });

  return (
    <main className="max-w-[760px] mx-auto px-8 pb-32 pt-2 flex flex-col h-full min-h-screen">
      <JournalHeader currentDate={dateStr} />
      <JournalEditor initialContent={entry?.content || ""} date={dateStr} />
      
      {/* Related Habits Section */}
      <div className="mt-16 pt-8 border-t border-stone-200/50 dark:border-stone-800/50">
        <h3 className="text-[10px] font-sans tracking-[0.2em] uppercase text-stone-400 font-medium mb-4">
          Related Habits Today
        </h3>
        <div className="flex flex-col gap-2">
          {habits.map(habit => {
            const status = logs.find(l => l.habitId === habit.id)?.status || "EMPTY";
            return (
              <div key={habit.id} className="flex items-center gap-3 text-sm font-medium">
                {status === "DONE" ? (
                  <span className="text-[#4A6750] dark:text-[#5C7E63] text-lg leading-none">☑</span>
                ) : status === "SKIP" ? (
                  <span className="text-stone-300 dark:text-stone-600 text-lg leading-none">☒</span>
                ) : (
                  <span className="text-stone-300 dark:text-stone-600 text-lg leading-none">☐</span>
                )}
                <span className={`transition-colors ${status === "DONE" ? "text-stone-400 dark:text-stone-500 line-through decoration-stone-300 dark:decoration-stone-600" : "text-stone-700 dark:text-stone-300"}`}>
                  {habit.name}
                </span>
              </div>
            );
          })}
          {habits.length === 0 && (
            <p className="text-xs text-stone-400">No active habits tracking today.</p>
          )}
        </div>
      </div>
    </main>
  );
}
