"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type HabitLog = {
  id: string;
  date: string;
  status: string;
  habit: { name: string };
};

export default function DashboardCharts({ logs }: { logs: HabitLog[] }) {
    // 1. Generate the last 5 days dynamically (just like the Grid)
  const days = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      dateKey: d.toISOString().split('T')[0], // e.g. "2024-10-24" (Matches the DB)
      label: d.toLocaleDateString('en-US', { weekday: 'short' }) // e.g. "Thu" (For the Chart)
    });
  }

  // 2. Set up a blank scoreboard using those dynamic dates
  const dataMap: Record<string, { label: string, count: number }> = {};
  days.forEach(day => {
    dataMap[day.dateKey] = { label: day.label, count: 0 };
  });

  // 3. Loop through the database logs and count the "DONE" habits
  logs.forEach(log => {
    if (log.status === "DONE" && dataMap[log.date]) {
      dataMap[log.date].count += 1;
    }
  });

  // 4. Format the final array exactly how the Recharts library expects it
  const chartData = days.map(day => ({
    name: day.label,
    completed: dataMap[day.dateKey].count
  }));

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      
      <div className="p-6 border rounded-xl shadow-sm bg-white dark:bg-black dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-6">Habits Completed by Day</h2>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}