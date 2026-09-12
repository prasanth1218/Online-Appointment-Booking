const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTimeString(value: string): boolean {
  return TIME_PATTERN.test(value);
}

/** Converts "HH:mm" to minutes since midnight. */
export function timeToMinutes(time: string): number {
  const match = TIME_PATTERN.exec(time);
  if (!match) throw new Error(`Invalid time string: ${time}`);
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Converts minutes since midnight back to a zero-padded "HH:mm" string. */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Parses a "YYYY-MM-DD" calendar date into a UTC-anchored Date (no time-of-day drift). */
export function parseCalendarDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year!, (month ?? 1) - 1, day ?? 1));
}

/** Formats a Date's UTC calendar fields as "YYYY-MM-DD" (matches parseCalendarDate). */
export function formatCalendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Today's calendar date as "YYYY-MM-DD", read from the server's local
 * wall-clock time. The whole scheduling system treats dates/times as the
 * clinic's local time with no timezone conversion (a deliberate,
 * documented simplification for a single-region clinic) — see README.
 */
export function todayCalendarDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function nowMinutesOfDay(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}
