"use server"; // This magic word creates the secure tunnel!

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addHabit(name: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  // Ask Prisma to create a new row in the database
  await prisma.habit.create({
    data: {
      name: name,
      userId: session.user.id
    }
  });

  // Tell Next.js to instantly refresh the homepage to show the new data!
  revalidatePath("/"); 
}

export async function toggleHabitStatus(habitId: string, day: string, newStatus: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  // 1. Search the database to see if a click already exists for this habit on this day
  const existingLog = await prisma.habitLog.findFirst({
    where: {
      habitId: habitId,
      date: day, // E.g., "Mon"
    }
  });

  // 2. The Upsert Logic
  if (existingLog) {
    // If it exists, UPDATE it!
    await prisma.habitLog.update({
      where: { id: existingLog.id },
      data: { status: newStatus }
    });
  } else {
    // If it doesn't exist, INSERT it!
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
export async function addTodo(title: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  await prisma.todo.create({
    data: {
      title: title,
      userId: session.user.id
    }
  });

  revalidatePath("/todos"); // Refresh the Todos page!
}

export async function toggleTodo(todoId: string, currentStatus: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  await prisma.todo.update({
    where: { id: todoId, userId: session.user.id },
    data: { isDone: !currentStatus } 
  });

  revalidatePath("/todos");
}

export async function deleteHabit(habitId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  await prisma.habit.delete({
    where: { id: habitId, userId: session.user.id }
  });
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function clearAllHabitLogs() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in!");

  // Delete all habit logs where the habit belongs to the user
  const userHabits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    select: { id: true }
  });
  
  const habitIds = userHabits.map(h => h.id);
  
  await prisma.habitLog.deleteMany({
    where: { habitId: { in: habitIds } }
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}