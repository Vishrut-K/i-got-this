import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardCharts from "@/components/DashboardCharts";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Fetch ALL logs for this user to pass to the charts
  const logs = await prisma.habitLog.findMany({
    where: { habit: { userId: session.user.id } },
    include: { habit: true }
  });

  return (
    <main>
      <DashboardCharts logs={logs} />
    </main>
  );
}