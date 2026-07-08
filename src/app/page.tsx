import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import prisma from "@/lib/prisma"; 
import { getLast7DaysStr } from "@/lib/date";

// Import components
import TodayHeader from "@/components/today/TodayHeader";

import HabitList from "@/components/today/HabitList";
// Removed QuoteSection and NotesPreview for a decluttered UI
import { calculateTodayProgress } from "@/lib/progress";

export const metadata = {
  title: "Today | I-got-this",
};

import LandingPage from "@/components/landing/LandingPage";

export default async function TodayPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    return <LandingPage />;
  }

  // Fetch habits
  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" }
  });

  const activeHabits = habits.filter(h => !h.archivedAt);

  // Fetch timezone from cookies
  const cookieStore = await cookies();
  const tz = cookieStore.get("x-timezone")?.value || "UTC";

  // Calculate the last 7 days (including today) using timezone
  const last7Days = getLast7DaysStr(tz);
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
  const { eligibleHabitsCount, percentage } = calculateTodayProgress(activeHabits, todayLogs);

  // Fetch yesterday's journal
  const yesterdayStr = last7Days[5];

  const yesterdayJournal = await prisma.journalEntry.findUnique({
    where: {
      userId_date: { userId: session.user.id, date: yesterdayStr }
    }
  });
  
  let insightText = "Every master was once a beginner. Start small today.";
  if (percentage === 100 && eligibleHabitsCount > 0) {
    insightText = "A perfect day. You are mastering your environment.";
  } else if (percentage >= 50) {
    insightText = "Good progress today. Keep the momentum going.";
  } else if (eligibleHabitsCount === 0) {
    insightText = "A day of rest is just as important as a day of work.";
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-8 pt-0 flex flex-col space-y-3">
      
      {/* 1. Header */}
      <TodayHeader name={session.user.name} />

      {/* 2. Hero Progress Card (Moved to HabitList for instant optimistic updates) */}

      {/* 3. The Core Action: Habits */}
      <section className="pt-1">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-[10px] tracking-widest uppercase text-stone-400 font-semibold">
            Today&apos;s Habits
          </h2>
          <span className="text-[10px] font-medium tracking-widest uppercase text-stone-800 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 px-2 py-1 rounded">
            TODAY • {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', timeZone: tz })}
          </span>
        </div>
        
        <HabitList 
          habits={habits} 
          allLogs={allLogs} 
          last7Days={last7Days}
        />
      </section>

      {/* Minimal Footer Insight */}
      <div className="mt-16 pt-8 text-center opacity-40 hover:opacity-100 transition-opacity duration-500">
        <p className="font-serif italic text-stone-600 dark:text-stone-400 text-sm">
          &quot;{insightText}&quot;
        </p>
      </div>

    </main>
  );
}
