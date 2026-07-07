import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma"; 
import { cookies } from "next/headers";
import { getLast7DaysStr } from "@/lib/date";

// Import components
import TodayHeader from "@/components/today/TodayHeader";
import TodayStats from "@/components/today/TodayStats";
import HabitList from "@/components/today/HabitList";
import QuoteSection from "@/components/today/QuoteSection";
import NotesPreview from "@/components/today/NotesPreview";

export const metadata = {
  title: "Today | I-got-this",
};

export default async function TodayPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/login");
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

  // We still need percentage to determine insightText
  const activeHabitsCount = activeHabits.length;
  const skippedCount = todayLogs.filter(log => log.status === "SKIP").length;
  const doneCount = todayLogs.filter(log => log.status === "DONE").length;
  const eligibleHabitsCount = activeHabitsCount - skippedCount;
  const percentage = eligibleHabitsCount === 0 
    ? (doneCount > 0 ? 100 : 0) 
    : Math.round((doneCount / eligibleHabitsCount) * 100);

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
    <main className="max-w-7xl mx-auto px-8 pb-8 pt-0 flex flex-col space-y-3">
      
      {/* 1. Header */}
      <TodayHeader name={session.user.name} />

      {/* 2 & 3. Hero Progress Card & Habits (Now unified to share optimistic state) */}
      <HabitList 
        habits={habits} 
        allLogs={allLogs} 
        last7Days={last7Days}
        todayFormatted={new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', timeZone: tz })}
      />

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
            "{insightText}"
          </div>
        </section>
      </div>

    </main>
  );
}
