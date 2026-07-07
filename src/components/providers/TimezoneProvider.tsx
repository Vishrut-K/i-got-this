"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const match = document.cookie.match(/(?:(?:^|.*;\s*)x-timezone\s*\=\s*([^;]*).*$)|^.*$/);
      const cookieTz = match ? match[1] : null;

      if (cookieTz !== tz) {
        document.cookie = `x-timezone=${tz}; path=/; max-age=31536000`; // 1 year
        router.refresh(); // Refresh server components so they get the new cookie
      }
    } catch (e) {
      console.error("Failed to set timezone cookie", e);
    }
  }, [router]);

  // Optionally, we could prevent rendering until mounted to avoid flashes,
  // but for SEO and speed, it's usually better to render immediately.
  // The refresh will happen quickly on the first ever visit.
  return <>{children}</>;
}
