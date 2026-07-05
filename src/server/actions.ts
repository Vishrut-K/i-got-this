"use server"; // This magic word creates the secure tunnel!

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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