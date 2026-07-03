import HabitGrid from "@/components/HabitGrid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma"; // We need to create this!


export default async function Home() {
  // 1. Check if the user is logged in
  const session = await auth.api.getSession({
    headers: await headers() 
  });

  // 2. If no session exists, kick them to the login page!
  if (!session) {
    redirect("/login");
  }

  // 3. Fetch ONLY the habits that belong to this specific user
  const userHabits = await prisma.habit.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      logs: true // Include the logs for each habit
    }
  });

  return (
    <main>
      <HabitGrid habits={userHabits} />
    </main>
  );
}