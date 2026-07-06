/**
 * Centralized date logic to solve timezone offset bugs.
 * We pass the user's timezone from a cookie (e.g. 'Asia/Kolkata').
 * If no timezone is provided, defaults to UTC.
 */

// Get the local "today" as YYYY-MM-DD
export function getLocalTodayStr(tz: string = "UTC"): string {
  // toLocaleDateString with 'en-CA' outputs YYYY-MM-DD format directly
  return new Date().toLocaleDateString('en-CA', { timeZone: tz });
}

// Get the last 7 days (including today) as an array of YYYY-MM-DD strings
export function getLast7DaysStr(tz: string = "UTC"): string[] {
  // To correctly step back days in a specific timezone, we can use the local date parts.
  // A robust way without heavy libraries:
  const now = new Date();
  
  // Format to mm/dd/yyyy, hh:mm:ss in the target timezone
  const tzDateStr = now.toLocaleString("en-US", { timeZone: tz });
  const tzDate = new Date(tzDateStr);

  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(tzDate);
    d.setDate(d.getDate() - i);
    
    // pad to YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push(`${yyyy}-${mm}-${dd}`);
  }
  
  return days;
}
