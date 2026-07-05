"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { updateUserPreferences } from "@/server/actions";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export default function ProfileForm({ user }: { user: any }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Local state for optimistic updates
  const [goal, setGoal] = useState(user.currentGoal || "");
  const [prefs, setPrefs] = useState({
    weekStartsOn: user.weekStartsOn,
    productiveThreshold: user.productiveThreshold,
    timeFormat: user.timeFormat,
    accentColor: user.accentColor,
    dailyQuote: user.dailyQuote,
    autosave: user.autosave,
    searchHistory: user.searchHistory,
    fontSize: user.fontSize,
    dailyReminder: user.dailyReminder,
    weeklyReview: user.weeklyReview,
    monthlySummary: user.monthlySummary,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (field: string, value: any) => {
    const newPrefs = { ...prefs, [field]: value };
    setPrefs(newPrefs);
    
    // Sync to backend
    setIsSaving(true);
    await updateUserPreferences({ [field]: value });
    setIsSaving(false);
    router.refresh();
  };

  const handleGoalSave = async () => {
    setIsSaving(true);
    await updateUserPreferences({ currentGoal: goal });
    setIsSaving(false);
    router.refresh();
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <div className="flex flex-col gap-16">
      
      {/* 0. Identity Sign Out (Moved here from Navbar) */}
      <div className="flex justify-start">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* 1. Current Goal */}
      <section>
        <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-stone-500 font-bold mb-6 flex items-center gap-4">
          Current Goal
          <div className="flex-1 h-px bg-stone-200/50 dark:bg-stone-800/50"></div>
        </h2>
        <div className="relative">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onBlur={handleGoalSave}
            placeholder="e.g. Become consistent. Run a half marathon."
            className="w-full bg-transparent text-3xl font-serif text-stone-800 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-700 resize-none outline-none focus:ring-0 p-0"
            rows={2}
          />
        </div>
      </section>

      {/* 2. Appearance */}
      <section>
        <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-stone-500 font-bold mb-6 flex items-center gap-4">
          Appearance
          <div className="flex-1 h-px bg-stone-200/50 dark:bg-stone-800/50"></div>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Theme Toggle - Segmented Control */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Theme</span>
            <div className="flex p-1 bg-stone-100 dark:bg-stone-900 rounded-lg w-fit border border-stone-200 dark:border-stone-800">
              {['light', 'system', 'dark'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-6 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                    theme === t 
                      ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm" 
                      : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Accent</span>
            <div className="flex gap-4 items-center h-full">
              {[
                { name: 'stone', class: 'bg-stone-500' },
                { name: 'olive', class: 'bg-[#5C7E63]' },
                { name: 'terracotta', class: 'bg-[#C17767]' },
                { name: 'sage', class: 'bg-[#84A59D]' }
              ].map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleUpdate('accentColor', color.name)}
                  className={`w-8 h-8 rounded-full ${color.class} transition-transform ${
                    prefs.accentColor === color.name ? "ring-2 ring-offset-2 ring-stone-800 dark:ring-stone-200 scale-110" : ""
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Preferences */}
      <section>
        <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-stone-500 font-bold mb-6 flex items-center gap-4">
          Preferences
          <div className="flex-1 h-px bg-stone-200/50 dark:bg-stone-800/50"></div>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          
          {/* Column 1: App */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-stone-200/50 dark:border-stone-800/50 pb-4 relative z-40">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Week Starts On</span>
              <CustomSelect 
                value={prefs.weekStartsOn} 
                options={["Monday", "Sunday"]} 
                onChange={(val) => handleUpdate('weekStartsOn', val)} 
              />
            </div>
            <div className="flex justify-between items-center border-b border-stone-200/50 dark:border-stone-800/50 pb-4 relative z-30">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Productive Threshold</span>
              <CustomSelect 
                value={prefs.productiveThreshold.toString()} 
                options={["60", "70", "80", "100"]} 
                displaySuffix="%"
                onChange={(val) => handleUpdate('productiveThreshold', parseInt(val))} 
              />
            </div>
            <div className="flex justify-between items-center border-b border-stone-200/50 dark:border-stone-800/50 pb-4 relative z-20">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Time Format</span>
              <CustomSelect 
                value={prefs.timeFormat} 
                options={["12h", "24h"]} 
                onChange={(val) => handleUpdate('timeFormat', val)} 
              />
            </div>
          </div>

          {/* Column 2: Journal & Quotes */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-stone-200/50 dark:border-stone-800/50 pb-4">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Daily Quote</span>
              <button onClick={() => handleUpdate('dailyQuote', !prefs.dailyQuote)} className="text-sm font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
                {prefs.dailyQuote ? "On" : "Off"}
              </button>
            </div>
            <div className="flex justify-between items-center border-b border-stone-200/50 dark:border-stone-800/50 pb-4">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Autosave</span>
              <button onClick={() => handleUpdate('autosave', !prefs.autosave)} className="text-sm font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
                {prefs.autosave ? "On" : "Off"}
              </button>
            </div>
            <div className="flex justify-between items-center border-b border-stone-200/50 dark:border-stone-800/50 pb-4 relative z-20">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Font Size</span>
              <CustomSelect 
                value={prefs.fontSize} 
                options={["Small", "Medium", "Large"]} 
                onChange={(val) => handleUpdate('fontSize', val)} 
              />
            </div>
          </div>

          {/* Column 3: Notifications */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-stone-200/50 dark:border-stone-800/50 pb-4">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Daily Reminder</span>
              <button onClick={() => handleUpdate('dailyReminder', !prefs.dailyReminder)} className="text-sm font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
                {prefs.dailyReminder ? "On" : "Off"}
              </button>
            </div>
            <div className="flex justify-between items-center border-b border-stone-200/50 dark:border-stone-800/50 pb-4 relative z-20">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Weekly Review</span>
              <CustomSelect 
                value={prefs.weeklyReview} 
                options={["Off", "Sunday", "Monday"]} 
                onChange={(val) => handleUpdate('weeklyReview', val)} 
              />
            </div>
            <div className="flex justify-between items-center border-b border-stone-200/50 dark:border-stone-800/50 pb-4">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Monthly Summary</span>
              <button onClick={() => handleUpdate('monthlySummary', !prefs.monthlySummary)} className="text-sm font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
                {prefs.monthlySummary ? "On" : "Off"}
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

function CustomSelect({ value, options, onChange, displaySuffix = "" }: { value: string, options: string[], onChange: (val: string) => void, displaySuffix?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
      >
        {value}{displaySuffix}
        <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-xl overflow-hidden py-1 z-50">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                value === opt 
                  ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium" 
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
              }`}
            >
              {opt}{displaySuffix}
            </button>
          ))}
        </div>
      )}
      
      {/* Click outside overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
