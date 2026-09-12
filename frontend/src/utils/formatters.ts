import { format, parse } from "date-fns";

/** Parses a "YYYY-MM-DD" calendar date string into a local Date at midnight (no timezone shifting). */
export function parseCalendarDate(dateStr: string): Date {
  return parse(dateStr, "yyyy-MM-dd", new Date());
}

export function formatCalendarDate(dateStr: string): string {
  return format(parseCalendarDate(dateStr), "yyyy-MM-dd");
}

export function formatLongDate(dateStr: string): string {
  return format(parseCalendarDate(dateStr), "EEEE, MMMM d, yyyy");
}

export function formatShortDate(dateStr: string): string {
  return format(parseCalendarDate(dateStr), "MMM d, yyyy");
}

/** "HH:mm" -> "9:00 AM" */
export function formatTime(time: string): string {
  return format(parse(time, "HH:mm", new Date()), "h:mm a");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatDateTime(dateStr: string, time: string): string {
  return `${formatLongDate(dateStr)} at ${formatTime(time)}`;
}

export function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
