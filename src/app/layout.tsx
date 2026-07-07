import "./globals.css";
import { Providers } from "@/components/providers";
import { Lora, Inter } from "next/font/google";

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

    {/* Layer 4: Micro SVG Noise (Organic Paper Grain) - Optimized using static background image */}
    <div 
      className="absolute inset-0 opacity-[0.25] dark:opacity-[0.12] mix-blend-multiply dark:mix-blend-overlay"
      style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3CfeColorMatrix type=%22saturate%22 values=%220%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
    />
  </div>
);

export const metadata = {
  title: "I-got-this",
  description: "A calm operating system for daily habits, reflection, and personal momentum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${lora.variable} font-sans min-h-screen bg-transparent text-foreground antialiased relative`}>
        
        <PremiumPaperBackground />

        <TimezoneProvider>
          <Providers>
            <ToastProvider>
              <Navbar />
              <div className="pt-2 relative z-10 pb-24 md:pb-0">
                {children}
              </div>
            </ToastProvider>
          </Providers>
        </TimezoneProvider>
      </body>
    </html>
  );
}
