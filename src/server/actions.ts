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
