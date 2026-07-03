import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import TodoList from "@/components/TodoList"; 

export default async function TodosPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  // Fetch the user's todos from Prisma, newest first
  const userTodos = await prisma.todo.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'desc' 
    }
  });

  return (
    <main>
      <TodoList todos={userTodos} />
    </main>
  );
}