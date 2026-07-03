"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type HabitLog = {
  id: string;
  date: string;
  status: string;
  habit: { name: string };
};

export default function DashboardCharts({ logs }: { logs: HabitLog[] }) {
  // We do a little math to count how many habits were "DONE" each day
  const dataMap: Record<string, number> = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0 };
  
  logs.forEach(log => {
    if (log.status === "DONE" && dataMap[log.date] !== undefined) {
      dataMap[log.date] += 1;
    }
  });

  const chartData = Object.keys(dataMap).map(day => ({
    name: day,
    completed: dataMap[day]
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