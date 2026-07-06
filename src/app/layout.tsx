import Link from "next/link";
import "./globals.css";
import { Providers } from "@/components/providers";
import LogoutButton from "@/components/LogoutButton";
import { Lora, Inter } from "next/font/google";
import Grainient from "@/components/Grainient";
import Navbar from "@/components/Navbar";
import TimezoneProvider from "@/components/providers/TimezoneProvider";

import { ToastProvider } from "@/components/ui/ToastProvider";

const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const PremiumPaperBackground = () => (
  <div className="fixed inset-0 pointer-events-none -z-10">
    {/* Layer 1: Base Canvas (Warm Ivory / Dark Charcoal) */}
    <div className="absolute inset-0 bg-[#F9F7F1] dark:bg-[#1A1A18] transition-colors duration-700" />
    
    {/* Layer 2: Soft Desk Lighting (Radial Glow) */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.95)_0%,_transparent_75%)] dark:bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.03)_0%,_transparent_75%)]" />

    {/* Layer 3: Edge Darkening (Vignette) */}
    <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(150,140,120,0.15)] dark:shadow-[inset_0_0_120px_rgba(0,0,0,0.8)]" />

    {/* Layer 4: Micro SVG Noise (Organic Paper Grain) */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.25] dark:opacity-[0.12] mix-blend-multiply dark:mix-blend-overlay">
      <filter id="paper-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-noise)" />
    </svg>
  </div>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${lora.variable} font-sans min-h-screen bg-transparent text-foreground antialiased relative overflow-y-scroll`}>
        
        <PremiumPaperBackground />

        <TimezoneProvider>
          <Providers>
            <ToastProvider>
              <Navbar />
              {/* --- NAVBAR ENDS HERE --- */}

              {/* This is where your page content goes! */}
              <div className="pt-2 relative z-10">
                {children}
              </div>
            </ToastProvider>
          </Providers>
        </TimezoneProvider>
      </body>
    </html>
  );
}