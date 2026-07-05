"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  
  // TEACHING MOMENT: Conditional Rendering
  if (pathname === "/login") return null;

  return (
    <>
      {/* --- DESKTOP NAVBAR (Hidden on mobile) --- */}
      <nav className="hidden md:flex sticky top-0 w-full z-50 bg-[#F4F4F0]/80 dark:bg-[#1A1A18]/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center px-8 py-2">
          
          {/* Left Column: Navigation Links */}
          <div className="flex gap-6 items-center">
            <NavLink href="/" current={pathname}>Today</NavLink>
            <NavLink href="/journal" current={pathname}>Journal</NavLink>
            <NavLink href="/journey" current={pathname}>Journey</NavLink>
            <NavLink href="/profile" current={pathname}>Profile</NavLink>
          </div>

          {/* Center Column: The Brand */}
          <div className="flex justify-center">
            <span className="font-bold text-xl tracking-tight font-serif text-stone-800 dark:text-stone-200 select-none">
              I-got-this
            </span>
          </div>

          {/* Right Column: Empty for now (Logout and Search moved to Profile/Journal) */}
          <div className="flex justify-end items-center gap-6">
            {/* Keeping this div to maintain the 3-column CSS Grid alignment */}
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM TAB BAR (Hidden on desktop) --- */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-[#F4F4F0]/90 dark:bg-[#1A1A18]/90 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 pb-safe">
        <div className="flex justify-between items-center px-6 py-4">
            <NavLink href="/" current={pathname}>Today</NavLink>
            <NavLink href="/journal" current={pathname}>Journal</NavLink>
            <NavLink href="/journey" current={pathname}>Journey</NavLink>
            <NavLink href="/profile" current={pathname}>Profile</NavLink>
        </div>
      </nav>
    </>
  );
}

function NavLink({ href, current, children }: { href: string; current: string; children: React.ReactNode }) {
  const isActive = current === href;
  
  return (
    <Link 
      href={href} 
      className={`text-xs tracking-widest uppercase transition-colors ${
        isActive 
          ? "text-stone-900 font-bold dark:text-stone-100" 
          : "text-stone-400 hover:text-stone-800 dark:hover:text-stone-300"
      }`}
    >
      {children}
    </Link>
  );
}