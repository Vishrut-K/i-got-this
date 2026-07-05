import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma"; 

// Import components
import TodayHeader from "@/components/today/TodayHeader";
import TodayStats from "@/components/today/TodayStats";
import HabitList from "@/components/today/HabitList";
import QuoteSection from "@/components/today/QuoteSection";
import NotesPreview from "@/components/today/NotesPreview";
import { calculateTodayProgress } from "@/lib/progress";

export const metadata = {
  title: "Today | I-got-this",
};

export default async function TodayPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/auth/sign-in");
  }

  // Fetch habits
  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" }
  });

  const activeHabits = habits.filter(h => !h.archivedAt);

  // Calculate the last 7 days (including today)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  const todayStr = last7Days[6];

  // Fetch ALL logs for the user's active habits (needed for streaks)
  const allLogs = await prisma.habitLog.findMany({
    where: {
      habitId: { in: activeHabits.map(h => h.id) }
    },
    orderBy: { date: "asc" }
  });

  // Filter logs for today
  const todayLogs = allLogs.filter(l => l.date === todayStr);

  // Calculate true progress using the new "SKIP is neutral" rules
  const { doneCount, eligibleHabitsCount, percentage } = calculateTodayProgress(activeHabits, todayLogs);

  // Fetch yesterday's journal
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const yesterdayJournal = await prisma.journalEntry.findUnique({
    where: {
      userId_date: { userId: session.user.id, date: yesterdayStr }
    }
  });
  
  return (
    <main className="max-w-7xl mx-auto px-8 pb-8 pt-0 flex flex-col space-y-3">
      
      {/* 1. Header */}
      <TodayHeader name={session.user.name} />

      {/* 2. Hero Progress Card */}
      <section>
        <TodayStats 
          completedCount={doneCount} 
          totalCount={eligibleHabitsCount} 
          percentageOverride={percentage}
        />
      </section>

      {/* 3. The Core Action: Habits */}
      <section className="pt-1">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-[10px] tracking-widest uppercase text-stone-400 font-semibold">
            Today's Habits
          </h2>
          <span className="text-[10px] font-medium tracking-widest uppercase text-stone-800 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 px-2 py-1 rounded">
            TODAY • {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        
        <HabitList 
          habits={habits} 
          allLogs={allLogs} 
          last7Days={last7Days}
        />
      </section>

      {/* Grid for bottom elements to save vertical space! */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* 4. Quote Section */}
        <QuoteSection />

        {/* 5. Journal Preview */}
        <section>
          <h2 className="text-[10px] tracking-widest uppercase text-stone-400 mb-4 font-semibold">
            Today's Journal
          </h2>
          <NotesPreview 
            yesterdayContent={yesterdayJournal?.content || null} 
          />
        </section>

        {/* 6. Insights */}
        <section>
          <h2 className="text-[10px] tracking-widest uppercase text-stone-400 mb-4 font-semibold">
            Insight
          </h2>
          <div className="pl-4 border-l-2 border-stone-300 dark:border-stone-700 italic text-stone-600 dark:text-stone-400 text-sm">
            "You are forming a powerful pattern. Keep going."
          </div>
        </section>
      </div>

    </main>
  );
}