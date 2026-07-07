"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { updateUserPreferences } from "@/server/actions";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProfileForm({ user }: { user: any }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Local state for optimistic updates
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



  const handleUpdate = async (field: string, value: unknown) => {
    const newPrefs = { ...prefs, [field]: value };
    setPrefs(newPrefs);
    
    // Sync to backend
    await updateUserPreferences({ [field]: value });
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
              {['light', 'system', 'dark'].map((t) => {
                const isActive = mounted ? theme === t : t === 'light';
                return (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-6 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                      isActive 
                        ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm" 
                        : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
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
              <ToggleSwitch checked={prefs.dailyQuote} onChange={(val) => handleUpdate('dailyQuote', val)} />
            </div>
            <div className="flex justify-between items-center border-b border-stone-200/50 dark:border-stone-800/50 pb-4">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Autosave</span>
              <ToggleSwitch checked={prefs.autosave} onChange={(val) => handleUpdate('autosave', val)} />
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
              <ToggleSwitch checked={prefs.dailyReminder} onChange={(val) => handleUpdate('dailyReminder', val)} />
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
              <ToggleSwitch checked={prefs.monthlySummary} onChange={(val) => handleUpdate('monthlySummary', val)} />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 dark:focus:ring-offset-stone-900 ${
        checked ? 'bg-theme-accent' : 'bg-stone-300 dark:bg-stone-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function CustomSelect({ value, options, onChange, displaySuffix = "" }: { value: string, options: string[], onChange: (val: string) => void, displaySuffix?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-32 px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent"
      >
        <span>{value}{displaySuffix}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                value === opt 
                  ? "bg-stone-100 dark:bg-stone-800 text-theme-accent font-bold" 
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
