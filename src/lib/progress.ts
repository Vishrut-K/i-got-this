type HabitLog = { habitId: string; status: string; date: string };

export function calculateStreaks(habitId: string, logs: HabitLog[], todayStr: string) {
  const habitLogs = logs.filter(l => l.habitId === habitId);
  const logMap: Record<string, string> = {};
  habitLogs.forEach(l => logMap[l.date] = l.status);

  let currentStreak = 0;
  let bestStreak = 0;

  const today = new Date(todayStr);
  let checkDate = new Date(today);

  // 1. Calculate Current Streak (Walking backwards from today)
  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const status = logMap[dateStr] || "EMPTY";
    
    if (dateStr === todayStr) {
      if (status === "DONE") currentStreak++;
      // If SKIP or EMPTY today, it doesn't break the streak (Grace Period)
    } else {
      if (status === "DONE") currentStreak++;
      else if (status === "SKIP") {
        // Holiday! Streak is paused but NOT broken.
      } else {
        // EMPTY or missing, streak is broken
        break;
      }
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // 2. Calculate Best Streak (Walking forwards from the first log)
  let tempStreak = 0;
  if (habitLogs.length > 0) {
    const firstDate = new Date(habitLogs[0].date);
    let iterDate = new Date(firstDate);
    
    while (iterDate <= today) {
      const dateStr = iterDate.toISOString().split("T")[0];
      const status = logMap[dateStr] || "EMPTY";
      
      if (status === "DONE") {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else if (status === "SKIP") {
        // Holiday! Streak is maintained.
      } else {
        // Broken
        tempStreak = 0;
      }
      
      iterDate.setDate(iterDate.getDate() + 1);
    }
  }

  return { currentStreak, bestStreak };
}

export function calculateTodayProgress(habits: any[], todayLogs: HabitLog[]) {
  const activeHabits = habits.filter(h => !h.archivedAt);
  
  // Rule: SKIP removes the habit from today's math entirely.
  const skippedCount = todayLogs.filter(log => log.status === "SKIP").length;
  const doneCount = todayLogs.filter(log => log.status === "DONE").length;
  
  const eligibleHabitsCount = activeHabits.length - skippedCount;
  
  const percentage = eligibleHabitsCount === 0 
    ? (doneCount > 0 ? 100 : 0) // Edge case: everything skipped but some done? (Shouldn't happen)
    : Math.round((doneCount / eligibleHabitsCount) * 100);

  return {
    doneCount,
    eligibleHabitsCount,
    percentage
  };
}
