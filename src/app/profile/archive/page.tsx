import { getArchivedHabits } from "@/server/actions";
import ArchiveClient from "@/components/profile/ArchiveClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Archive | I-got-this",
};

export default async function ArchivePage() {
  const archivedHabits = await getArchivedHabits();

  return (
    <main className="max-w-4xl mx-auto px-6 sm:px-8 pb-32 pt-2 flex flex-col h-full min-h-screen">
      
      <header className="flex flex-col items-start border-b border-stone-200/50 dark:border-stone-800/50 pb-8 mb-12 mt-4">
        <Link href="/profile" className="flex items-center gap-2 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors mb-6 text-sm font-medium">
          <ArrowLeft size={16} />
          Back to Profile
        </Link>
        <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Archived Habits
        </h1>
        <p className="text-sm text-stone-500 mt-2">
          Habits you have retired. You can restore them or permanently delete them.
        </p>
      </header>

      {archivedHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl">
          <p className="text-stone-500 font-medium">Nothing archived yet.</p>
          <p className="text-stone-400 text-sm mt-1">Retired habits will appear here.</p>
        </div>
      ) : (
        <ArchiveClient initialHabits={archivedHabits} />
      )}

    </main>
  );
}
