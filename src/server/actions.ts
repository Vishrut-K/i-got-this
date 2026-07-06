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

  // Ask Prisma to create a new row with the icon and color data
  await prisma.habit.create({
    data: {
      name: name,
      iconId: iconId,
      color: color,
      userId: session.user.id
    }
  });

  revalidatePath("/"); 
}

export async function toggleHabitStatus(habitId: string, day: string, newStatus: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

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
}

export async function saveJournalEntry(date: string, content: string, tasks: any = []) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

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
  await prisma.journalEntry.update({
    where: {
      userId_date: { userId: session.user.id, date: date }
    },
    data: {
      content: "",
      tasks: []
    }
  });
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
  const habitBreakdown = habits.filter(h => !h.archivedAt).map(habit => {
    const logs = allLogs.filter(l => l.habitId === habit.id).sort((a, b) => a.date.localeCompare(b.date));
    
    let currentStreak = 0;
    let bestStreak = 0;
    let habitCompletions = 0;
    
    // Convert to a map for O(1) lookups
    const logMap = new Map(logs.map(l => [l.date, l.status]));
    
    // Calculate streaks by iterating backwards from today
    const cookieStore = await cookies();
    const tz = cookieStore.get("x-timezone")?.value || "UTC";
    const todayStr = getLocalTodayStr(tz);
    
    // Check current streak
    let d = new Date(today);
    while (true) {
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

  const habitMatrixData: Record<string, Record<string, string>> = {};
  habits.filter(h => !h.archivedAt).forEach(habit => {
    habitMatrixData[habit.id] = {};
    const habitCreatedAt = habit.createdAt.toISOString().split('T')[0];
    
    matrixDays.forEach(day => {
      const log = allLogs.find(l => l.habitId === habit.id && l.date === day);
      if (day < habitCreatedAt) {
        habitMatrixData[habit.id][day] = "UNAVAILABLE";
      } else if (log) {
        habitMatrixData[habit.id][day] = log.status;
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

export async function updateUserPreferences(data: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  const allowedFields = [
    "currentGoal",
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

  const safeData: any = {};
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
  let totalCompletions = 0;
  let productiveDaysSet = new Set<string>();
  
  allLogs.forEach(log => {
    if (log.status === "DONE") {
      totalCompletions++;
      productiveDaysSet.add(log.date);
    }
  });

  const { habitBreakdown } = await getJourneyStats(); // Re-use streak math
  const longestActiveStreak = habitBreakdown.reduce((max, h) => Math.max(max, h.currentStreak), 0);
  const bestAllTimeStreak = habitBreakdown.reduce((max, h) => Math.max(max, h.bestStreak), 0);

  // Storage Stats
  const wordsWritten = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    select: { content: true }
  }).then(entries => entries.reduce((acc, entry) => acc + (entry.content.match(/\w+/g)?.length || 0), 0));

  return {
    user,
    stats: {
      currentStreak: longestActiveStreak,
      bestStreak: bestAllTimeStreak,
      productiveDays: productiveDaysSet.size,
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
}

export async function deleteHabitForever(habitId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  await prisma.habit.delete({
    where: { id: habitId, userId: session.user.id }
  });
}

export async function deleteUserAccount() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  // Due to Cascade deletes in Prisma schema, deleting the user wipes everything
  await prisma.user.delete({
    where: { id: session.user.id }
  });
}