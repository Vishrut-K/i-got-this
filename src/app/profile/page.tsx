import { getUserProfile } from "@/server/actions";
import ProfileForm from "@/components/profile/ProfileForm";
import DangerZone from "@/components/profile/DangerZone";
import Link from "next/link";
import Image from "next/image";
import { Download, Upload, Server, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Profile | I-got-this",
};

export default async function ProfilePage() {
  const { user, stats } = await getUserProfile();

  if (!user) {
    return null;
  }

  // Parse Member Since
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <main className="max-w-4xl mx-auto px-6 sm:px-8 pb-32 pt-2 flex flex-col h-full min-h-screen">
      
      {/* 1. Header (Identity) */}
      <header className="flex flex-col items-center justify-center border-b border-stone-200/50 dark:border-stone-800/50 pb-8 mb-12 mt-4">
        <h1 className="text-[10px] font-sans tracking-[0.3em] uppercase text-stone-400 font-bold mb-2">
          Profile
        </h1>
        <div className="w-12 h-px bg-stone-300 dark:bg-stone-700"></div>
      </header>

      {/* 2. Identity Block */}
      <section className="flex flex-col items-center mb-16">
        <div className="w-20 h-20 rounded-full bg-stone-200 dark:bg-stone-800 mb-4 flex items-center justify-center overflow-hidden">
          {user.image ? (
            <Image src={user.image} alt={user.name || "Avatar"} width={80} height={80} className="w-full h-full object-cover" unoptimized />
          ) : (
            <span className="text-2xl font-serif text-stone-500">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">{user.name || "Anonymous"}</h2>
        <p className="text-sm text-stone-500 mb-1">{user.email}</p>
        <p className="text-xs text-stone-400">Member Since {memberSince}</p>
      </section>

      {/* 3. Lifetime Summary */}
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8">
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-light font-sans tracking-tighter text-stone-800 dark:text-stone-200 flex items-baseline gap-1">
              {stats.currentStreak} <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">Days</span>
            </span>
            <span className="text-[10px] font-sans tracking-widest uppercase text-emerald-600 dark:text-emerald-500 font-bold mt-2">🔥 Current Streak</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-light font-sans tracking-tighter text-stone-800 dark:text-stone-200 flex items-baseline gap-1">
              {stats.bestStreak} <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">Days</span>
            </span>
            <span className="text-[10px] font-sans tracking-widest uppercase text-stone-400 font-bold mt-2">🏆 Best Streak</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-light font-sans tracking-tighter text-stone-800 dark:text-stone-200">
              {stats.productiveDays}
            </span>
            <span className="text-[10px] font-sans tracking-widest uppercase text-stone-400 font-bold mt-2">✓ Productive Days</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-light font-sans tracking-tighter text-stone-800 dark:text-stone-200">
              {stats.journalEntries}
            </span>
            <span className="text-[10px] font-sans tracking-widest uppercase text-stone-400 font-bold mt-2">Journal Entries</span>
          </div>
          <div className="flex flex-col items-center text-center col-span-2 md:col-span-1">
            <span className="text-3xl font-light font-sans tracking-tighter text-stone-800 dark:text-stone-200">
              {stats.habitsCreated}
            </span>
            <span className="text-[10px] font-sans tracking-widest uppercase text-stone-400 font-bold mt-2">Habits Created</span>
          </div>
        </div>
      </section>

      {/* Form (Goal, Appearance, Preferences) */}
      <ProfileForm user={user} />

      {/* 4. Data & Storage */}
      <section className="mt-16">
        <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-stone-500 font-bold mb-6 flex items-center gap-4">
          Data & Storage
          <div className="flex-1 h-px bg-stone-200/50 dark:bg-stone-800/50"></div>
        </h2>
        
        <div className="flex flex-col p-8 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2 mb-6 text-stone-500">
            <Server size={16} />
            <span className="text-xs uppercase tracking-widest font-semibold">Your Data</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-stone-200/50 dark:border-stone-800/50 pb-4 sm:pb-0 sm:pr-8">
              <span className="text-sm text-stone-500 mb-1">Habit Logs</span>
              <span className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-200">{stats.habitLogs.toLocaleString()}</span>
            </div>
            <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-stone-200/50 dark:border-stone-800/50 pb-4 sm:pb-0 sm:px-8">
              <span className="text-sm text-stone-500 mb-1">Journal Pages</span>
              <span className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-200">{stats.journalEntries.toLocaleString()}</span>
            </div>
            <div className="flex flex-col sm:pl-8">
              <span className="text-sm text-stone-500 mb-1">Words Written</span>
              <span className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-200">{stats.wordsWritten.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Archived Habits */}
      <section className="mt-16">
        <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-stone-500 font-bold mb-6 flex items-center gap-4">
          Archived Habits
          <div className="flex-1 h-px bg-stone-200/50 dark:bg-stone-800/50"></div>
        </h2>
        <Link href="/profile/archive" className="group flex justify-between items-center p-6 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">View Archive</span>
            <span className="text-xs text-stone-500 mt-1">Restore or permanently delete retired habits.</span>
          </div>
          <ArrowRight className="text-stone-400 group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors" />
        </Link>
      </section>

      {/* 6. About */}
      <section className="mt-16">
        <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-stone-500 font-bold mb-6 flex items-center gap-4">
          About
          <div className="flex-1 h-px bg-stone-200/50 dark:bg-stone-800/50"></div>
        </h2>
        <div className="flex flex-col sm:flex-row justify-between text-sm text-stone-500 gap-4">
          <div className="flex gap-6">
            <span>I-got-this v1.0</span>
            <span>Made by Vishrut</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-stone-800 dark:hover:text-stone-300">GitHub</Link>
            <Link href="#" className="hover:text-stone-800 dark:hover:text-stone-300">Privacy</Link>
            <Link href="#" className="hover:text-stone-800 dark:hover:text-stone-300">Terms</Link>
          </div>
        </div>
      </section>

      {/* 7. Danger Zone */}
      <DangerZone />

    </main>
  );
}
