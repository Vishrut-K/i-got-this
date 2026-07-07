"use server"; // This magic word creates the secure tunnel!

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getLocalTodayStr } from "@/lib/date";

export async function addHabit(name: string, iconId: string, color: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  if (typeof name !== "string" || name.length > 100) throw new Error("Invalid name");
  if (typeof iconId !== "string" || iconId.length > 50) throw new Error("Invalid iconId");
  if (typeof color !== "string" || color.length > 50) throw new Error("Invalid color");

  // Enforce maximum 50 habits per user
  const habitCount = await prisma.habit.count({
    where: { userId: session.user.id }
  });

  if (habitCount >= 50) {
    throw new Error("Maximum of 50 habits reached. Archive or delete old ones first.");
  }

  // Ask Prisma to create a new row with the icon and color data
  const habit = await prisma.habit.create({
    data: {
      name: name,
      iconId: iconId,
      color: color,
      userId: session.user.id
    }
  });

  revalidatePath("/");
  revalidatePath("/journey");
  revalidatePath("/profile");
  return { ok: true, habitId: habit.id };
}

export async function updateHabitName(habitId: string, newName: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  if (typeof newName !== "string" || newName.length > 100 || newName.trim().length === 0) {
    throw new Error("Invalid name");
  }

  await prisma.habit.update({
    where: { id: habitId, userId: session.user.id },
    data: { name: newName.trim() }
  });

  revalidatePath("/");
  revalidatePath("/journey");
  revalidatePath("/profile");
  return { ok: true };
}

export async function updateUserName(newName: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  if (typeof newName !== "string" || newName.length > 100 || newName.trim().length === 0) {
    throw new Error("Invalid name");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: newName.trim() }
  });

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}

export async function toggleHabitStatus(habitId: string, day: string, newStatus: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  if (!["DONE", "SKIP", "EMPTY"].includes(newStatus)) {
    throw new Error("Invalid status");
  }

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: session.user.id }
  });

  if (!habit) {
    throw new Error("Habit not found or access denied");
  }

  const existingLog = await prisma.habitLog.findFirst({
    where: {
      habitId: habitId,
      date: day,
    }
  });

  if (existingLog) {
    await prisma.habitLog.update({
      where: { id: existingLog.id },
      data: { status: newStatus }
    });
  } else {
    await prisma.habitLog.create({
      data: {
        habitId: habitId,
        date: day,
        status: newStatus
      }
    });
  }
  revalidatePath("/");
  revalidatePath("/journey");
  revalidatePath("/profile");
  return { ok: true };
}

// TEACHING MOMENT: Data Integrity (Archive vs Delete)
// We NEVER delete a habit. If we delete it, we lose all the history of when they checked it off.
// Instead, we mark it as "Archived". This hides it from the UI but keeps the data safe!
export async function archiveHabit(habitId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  await prisma.habit.update({
    where: { id: habitId, userId: session.user.id },
    data: { archivedAt: new Date() }
  });
  
  revalidatePath("/");
  revalidatePath("/journey");
  revalidatePath("/profile");
  revalidatePath("/profile/archive");
  return { ok: true };
}

export async function saveJournalEntry(date: string, content: string, tasks: unknown = []) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  if (typeof content !== "string" || content.length > 100000) {
    throw new Error("Content too large");
  }

  // UPSERT: The smartest database command.
  // "If it exists, update it. If it doesn't, create it."
  await prisma.journalEntry.upsert({
    where: {
      userId_date: { userId: session.user.id, date: date }
    },
    update: {
      content: content,
      tasks: tasks
    },
    create: {
      userId: session.user.id,
      date: date,
      content: content,
      tasks: tasks
    }
  });
}

export async function getJournalEntry(date: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  return await prisma.journalEntry.findUnique({
    where: {
      userId_date: { userId: session.user.id, date: date }
    }
  });
}

export async function clearJournalEntry(date: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  // "Tear the page" - we just update it to be blank instead of deleting the row
  try {
    await prisma.journalEntry.update({
      where: {
        userId_date: { userId: session.user.id, date: date }
      },
      data: {
        content: "",
        tasks: []
      }
    });
  } catch {
    // Ignore P2025 error if no entry exists
  }
}

// ==========================================
// STEP 9: THE JOURNEY MATH ENGINE
// ==========================================
export async function getJourneyStats() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  const userId = session.user.id;

  // 1. Fetch ALL habits and ALL logs for this user
  const habits = await prisma.habit.findMany({ where: { userId } });
  const allLogs = await prisma.habitLog.findMany({
    where: { habitId: { in: habits.map(h => h.id) } },
    orderBy: { date: 'asc' }
  });

  // 2. Global Metrics
  let totalCompletions = 0;
  const daysMap: Record<string, { done: number, skip: number, total: number }> = {};
  
  // Initialize days map with all logs
  allLogs.forEach(log => {
    if (!daysMap[log.date]) {
      // Find how many habits existed on or before this date
      const activeHabits = habits.filter(h => {
        const createdAtDate = h.createdAt.toISOString().split('T')[0];
        return createdAtDate <= log.date;
      });
      daysMap[log.date] = { done: 0, skip: 0, total: activeHabits.length };
    }
    
    if (log.status === "DONE") {
      totalCompletions++;
      daysMap[log.date].done++;
    } else if (log.status === "SKIP") {
      daysMap[log.date].skip++;
    }
  });

  // 3. Perfect Days & Heatmap Data
  let perfectDays = 0;
  const heatmapData: Record<string, number> = {}; // Date -> 0 to 4 (intensity)

  Object.entries(daysMap).forEach(([date, stats]) => {
    const eligible = Math.max(0, stats.total - stats.skip);
    const percentage = eligible === 0 ? (stats.skip > 0 ? 0 : 0) : (stats.done / eligible);
    
    if (percentage >= 1.0 && eligible > 0) {
      perfectDays++;
    }

    // Map percentage (0-1) to intensity (0-4) for the GitHub graph
    if (stats.skip > 0 && stats.done === 0) {
      heatmapData[date] = -1; // Special flag for "skipped but no progress"
    } else if (percentage === 0) {
      heatmapData[date] = 0;
    } else if (percentage <= 0.25) {
      heatmapData[date] = 1;
    } else if (percentage <= 0.5) {
      heatmapData[date] = 2;
    } else if (percentage <= 0.75) {
      heatmapData[date] = 3;
    } else {
      heatmapData[date] = 4;
    }
  });

  // 4. Habit Breakdown (Streaks and Rates)
  const cookieStore = await cookies();
  const tz = cookieStore.get("x-timezone")?.value || "UTC";
  const todayStr = getLocalTodayStr(tz);

  const habitBreakdown = habits.filter(h => !h.archivedAt).map(habit => {
    const logs = allLogs.filter(l => l.habitId === habit.id).sort((a, b) => a.date.localeCompare(b.date));
    
    let currentStreak = 0;
    let bestStreak = 0;
    let habitCompletions = 0;
    
    // Convert to a map for O(1) lookups
    const logMap = new Map(logs.map(l => [l.date, l.status]));
    
    // Calculate streaks by iterating backwards from today
    
    // Check current streak
    let d = new Date(todayStr);
    let loops = 0;
    while (loops < 1000) {
      const dStr = d.toISOString().split('T')[0];
      const status = logMap.get(dStr);
      if (status === "DONE") {
        currentStreak++;
      } else if (status === "SKIP") {
        // Skip doesn't break, but doesn't add
      } else {
        // If it's today and not filled, we don't break the streak yet, just look at yesterday
        if (dStr !== todayStr) break;
      }
      d.setDate(d.getDate() - 1);
      loops++;
    }

    // Calculate best streak (simplified forward pass)
    let tempStreak = 0;
    const createdAt = habit.createdAt.toISOString().split('T')[0];
    d = new Date(createdAt);
    
    while (d.toISOString().split('T')[0] <= todayStr) {
      const dStr = d.toISOString().split('T')[0];
      const status = logMap.get(dStr);
      if (status === "DONE") {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        habitCompletions++;
      } else if (status === "SKIP") {
        // Keeps streak alive
      } else {
        tempStreak = 0; // Broken
      }
      d.setDate(d.getDate() + 1);
    }

    // Completion Rate (since creation)
    const daysSinceCreation = Math.floor((new Date(todayStr).getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24)) + 1;
    const completionRate = daysSinceCreation > 0 ? (habitCompletions / daysSinceCreation) * 100 : 0;

    return {
      id: habit.id,
      name: habit.name,
      color: habit.color,
      iconId: habit.iconId,
      currentStreak,
      bestStreak,
      totalCompletions: habitCompletions,
      completionRate: Math.round(completionRate)
    };
  });

  // 5. Build Habit Matrix (Last 14 Days)
  const cookieStoreTz = await cookies();
  const globalTz = cookieStoreTz.get("x-timezone")?.value || "UTC";
  const globalTodayStr = getLocalTodayStr(globalTz);

  const matrixDays: string[] = [];
  const startMatrixDate = new Date(globalTodayStr);
  startMatrixDate.setDate(startMatrixDate.getDate() - 13);
  for (let i = 0; i < 14; i++) {
    const d = new Date(startMatrixDate);
    d.setDate(d.getDate() + i);
    matrixDays.push(d.toISOString().split('T')[0]);
  }

  // Pre-compute O(1) map
  const allLogsMap = new Map(allLogs.map(l => [`${l.habitId}-${l.date}`, l.status]));

  const habitMatrixData: Record<string, Record<string, string>> = {};
  habits.filter(h => !h.archivedAt).forEach(habit => {
    habitMatrixData[habit.id] = {};
    const habitCreatedAt = habit.createdAt.toISOString().split('T')[0];
    
    matrixDays.forEach(day => {
      const status = allLogsMap.get(`${habit.id}-${day}`);
      if (day < habitCreatedAt) {
        habitMatrixData[habit.id][day] = "UNAVAILABLE";
      } else if (status) {
        habitMatrixData[habit.id][day] = status;
      } else {
        habitMatrixData[habit.id][day] = "EMPTY";
      }
    });
  });

  // 6. Find global longest active streak
  const longestActiveStreak = habitBreakdown.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  return {
    totalCompletions,
    perfectDays,
    longestActiveStreak,
    heatmapData,
    habitBreakdown,
    matrixDays,
    habitMatrixData
  };
}

// ==========================================
// STEP 10: THE PROFILE & PREFERENCES
// ==========================================

export async function updateUserPreferences(data: Record<string, unknown>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  const allowedFields = [
    "weekStartsOn",
    "productiveThreshold",
    "timeFormat",
    "accentColor",
    "dailyQuote",
    "autosave",
    "searchHistory",
    "fontSize",
    "dailyReminder",
    "weeklyReview",
    "monthlySummary"
  ];

  const safeData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      safeData[field] = data[field];
    }
  }

  return prisma.user.update({
    where: { id: session.user.id },
    data: safeData
  });
}

export async function getUserProfile() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  // Fetch full user with preferences
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  // Calculate Lifetime Summary
  const habits = await prisma.habit.findMany({ where: { userId: session.user.id } });
  const habitIds = habits.map(h => h.id);
  
  const allLogs = await prisma.habitLog.findMany({
    where: { habitId: { in: habitIds } },
    orderBy: { date: 'asc' }
  });

  const journalEntries = await prisma.journalEntry.count({
    where: { userId: session.user.id }
  });

  // Calculate stats
  const daysMap = new Map<string, { done: number, total: number }>();
  
  allLogs.forEach(log => {
    if (!daysMap.has(log.date)) {
      const activeHabits = habits.filter(h => h.createdAt.toISOString().split('T')[0] <= log.date);
      daysMap.set(log.date, { done: 0, total: activeHabits.length });
    }
    
    const dayStats = daysMap.get(log.date)!;
    if (log.status === "DONE") {
      dayStats.done++;
    }
  });

  let productiveDaysCount = 0;
  const threshold = (user?.productiveThreshold || 70) / 100;
  daysMap.forEach((stats) => {
    if (stats.total > 0 && (stats.done / stats.total) >= threshold) {
      productiveDaysCount++;
    }
  });

  const cookieStore = await cookies();
  const todayStr = getLocalTodayStr(cookieStore.get("x-timezone")?.value || "UTC");
  const logsByHabit = new Map<string, Map<string, string>>();

  allLogs.forEach((log) => {
    if (!logsByHabit.has(log.habitId)) {
      logsByHabit.set(log.habitId, new Map());
    }
    logsByHabit.get(log.habitId)!.set(log.date, log.status);
  });

  const streaks = habits
    .filter((habit) => !habit.archivedAt)
    .map((habit) => {
      const logMap = logsByHabit.get(habit.id) || new Map<string, string>();
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      let cursor = new Date(habit.createdAt.toISOString().split("T")[0]);
      const today = new Date(todayStr);

      while (cursor <= today) {
        const date = cursor.toISOString().split("T")[0];
        const status = logMap.get(date);

        if (status === "DONE") {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else if (status !== "SKIP") {
          tempStreak = 0;
        }

        cursor.setDate(cursor.getDate() + 1);
      }

      cursor = new Date(todayStr);
      for (let i = 0; i < 1000; i++) {
        const date = cursor.toISOString().split("T")[0];
        const status = logMap.get(date);

        if (status === "DONE") {
          currentStreak++;
        } else if (status !== "SKIP" && date !== todayStr) {
          break;
        }

        cursor.setDate(cursor.getDate() - 1);
      }

      return { currentStreak, bestStreak };
    });

  const longestActiveStreak = streaks.reduce((max, h) => Math.max(max, h.currentStreak), 0);
  const bestAllTimeStreak = streaks.reduce((max, h) => Math.max(max, h.bestStreak), 0);

  // Storage Stats
  const wordsWritten = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    select: { content: true }
  }).then(entries => entries.reduce((acc, entry) => {
    const text = entry.content.replace(/<[^>]+>/g, ' ');
    return acc + (text.match(/\w+/g)?.length || 0);
  }, 0));

  return {
    user,
    stats: {
      currentStreak: longestActiveStreak,
      bestStreak: bestAllTimeStreak,
      productiveDays: productiveDaysCount,
      journalEntries,
      habitsCreated: habits.length,
      habitLogs: allLogs.length,
      wordsWritten
    }
  };
}

export async function getArchivedHabits() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  const habits = await prisma.habit.findMany({
    where: { 
      userId: session.user.id,
      archivedAt: { not: null }
    },
    include: {
      _count: {
        select: { logs: { where: { status: "DONE" } } }
      }
    },
    orderBy: { archivedAt: 'desc' }
  });

  return habits;
}

export async function restoreHabit(habitId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  await prisma.habit.update({
    where: { id: habitId, userId: session.user.id },
    data: { archivedAt: null }
  });
  revalidatePath("/");
  revalidatePath("/journey");
  revalidatePath("/profile");
  revalidatePath("/profile/archive");
  return { ok: true };
}

export async function deleteHabitForever(habitId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  await prisma.habit.delete({
    where: { id: habitId, userId: session.user.id }
  });
  revalidatePath("/");
  revalidatePath("/journey");
  revalidatePath("/profile");
  revalidatePath("/profile/archive");
  return { ok: true };
}

export async function restoreAllArchivedHabits() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  await prisma.habit.updateMany({
    where: { userId: session.user.id, archivedAt: { not: null } },
    data: { archivedAt: null }
  });
  revalidatePath("/");
  revalidatePath("/journey");
  revalidatePath("/profile");
  revalidatePath("/profile/archive");
  return { ok: true };
}

export async function deleteAllArchivedHabits() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  await prisma.habit.deleteMany({
    where: { userId: session.user.id, archivedAt: { not: null } }
  });
  revalidatePath("/");
  revalidatePath("/journey");
  revalidatePath("/profile");
  revalidatePath("/profile/archive");
  return { ok: true };
}

export async function deleteUserAccount() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  // Due to Cascade deletes in Prisma schema, deleting the user wipes everything
  await prisma.user.delete({
    where: { id: session.user.id }
  });
}
