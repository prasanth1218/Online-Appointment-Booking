import { minutesToTime, nowMinutesOfDay, timeToMinutes, todayCalendarDate } from "./time.js";

export interface WeeklyTemplateRow {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

/** Patients must book at least this far ahead of a slot's start time. */
const MIN_BOOKING_LEAD_MINUTES = 30;

export function generateSlotsForDay(
  templateRows: WeeklyTemplateRow[],
  dayOfWeek: number,
  slotDurationMinutes: number,
): TimeSlot[] {
  const rowsForDay = templateRows.filter((row) => row.dayOfWeek === dayOfWeek);
  const slots: TimeSlot[] = [];

  for (const row of rowsForDay) {
    const start = timeToMinutes(row.startTime);
    const end = timeToMinutes(row.endTime);
    for (let cursor = start; cursor + slotDurationMinutes <= end; cursor += slotDurationMinutes) {
      slots.push({
        startTime: minutesToTime(cursor),
        endTime: minutesToTime(cursor + slotDurationMinutes),
        available: true,
      });
    }
  }

  return slots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

/**
 * Combines a doctor's weekly template with booked slots and "now" to
 * produce the final list of bookable slots for one calendar date.
 */
export function computeAvailableSlots(params: {
  date: string;
  templateRows: WeeklyTemplateRow[];
  slotDurationMinutes: number;
  bookedStartTimes: Set<string>;
  isDayOff: boolean;
}): TimeSlot[] {
  if (params.isDayOff) return [];

  const dayOfWeek = new Date(`${params.date}T00:00:00Z`).getUTCDay();
  const baseSlots = generateSlotsForDay(params.templateRows, dayOfWeek, params.slotDurationMinutes);
  const isToday = params.date === todayCalendarDate();
  const currentMinutes = nowMinutesOfDay();

  return baseSlots.map((slot) => {
    const isBooked = params.bookedStartTimes.has(slot.startTime);
    const isPast = isToday && timeToMinutes(slot.startTime) < currentMinutes + MIN_BOOKING_LEAD_MINUTES;
    return { ...slot, available: !isBooked && !isPast };
  });
}
