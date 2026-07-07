"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { Save } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  if (pathname === "/login" || pathname === "/signup" || pathname === "/reset-password") return null;
  if (pathname === "/" && !session) return null;

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
          <div className="flex justify-center items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="w-6 h-6 object-contain grayscale opacity-90 rounded-full overflow-hidden shadow-sm bg-white" unoptimized />
            <span className="font-bold text-xl tracking-tight font-serif text-stone-800 dark:text-stone-200 select-none">
              I-got-this
            </span>
          </div>

          <div className="flex justify-end items-center gap-2 md:gap-4">
            {session?.user?.isAnonymous && (
              <Link 
                href="/login?upgrade=true"
                className="hidden md:flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950/30 px-3 py-1.5 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
              >
                <Save size={12} strokeWidth={2.5} />
                Save Account
              </Link>
            )}
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
      prefetch
      aria-current={isActive ? "page" : undefined}
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
