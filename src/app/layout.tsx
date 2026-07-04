import Link from "next/link";
import "./globals.css";
import { Providers } from "@/components/providers";
import LogoutButton from "@/components/LogoutButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
            <body className="bg-zinc-50 dark:bg-black text-black dark:text-white min-h-screen">
        <Providers>
          {/* --- NAVBAR STARTS HERE --- */}
          <nav className="border-b dark:border-zinc-800 p-4 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-50">
            <div className="max-w-3xl mx-auto flex gap-6 items-center">
              <span className="font-bold text-xl mr-4 tracking-tight">i-got-it</span>
              <Link href="/" className="hover:text-blue-500 transition-colors">Tracker</Link>
              <Link href="/todos" className="hover:text-blue-500 transition-colors">To-Dos</Link>
              <Link href="/dashboard" className="hover:text-blue-500 transition-colors">Dashboard</Link>
              <Link href="/dashboard" className="hover:text-blue-500 transition-colors">Dashboard</Link>
<LogoutButton />
            </div>
          </nav>
          {/* --- NAVBAR ENDS HERE --- */}

          {/* This is where your page content goes! */}
          <div className="pt-8">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}