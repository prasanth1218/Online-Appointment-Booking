import { format } from "date-fns";
import clsx from "clsx";
import { CalendarDays } from "lucide-react";

interface DateStripProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  daysToShow?: number;
  maxDate: string;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DateStrip({ selectedDate, onSelect, daysToShow = 14, maxDate }: DateStripProps) {
  const today = new Date();
  const days = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-2">
        {days.map((date) => {
          const key = toDateKey(date);
          const isSelected = key === selectedDate;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-pressed={isSelected}
              className={clsx(
                "flex min-w-[4.25rem] flex-col items-center rounded-xl border px-3 py-2.5 transition-colors",
                isSelected
                  ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                  : "border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:bg-brand-50",
              )}
            >
              <span className={clsx("text-[11px] font-medium uppercase", isSelected ? "text-white/80" : "text-ink-400")}>
                {format(date, "EEE")}
              </span>
              <span className="mt-0.5 font-display text-lg font-semibold">{format(date, "d")}</span>
              <span className={clsx("text-[11px]", isSelected ? "text-white/80" : "text-ink-400")}>{format(date, "MMM")}</span>
            </button>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-600">
        <CalendarDays className="size-4 text-ink-400" aria-hidden="true" />
        Or pick a specific date:
        <input
          type="date"
          value={selectedDate}
          min={toDateKey(today)}
          max={maxDate}
          onChange={(e) => e.target.value && onSelect(e.target.value)}
          className="rounded-lg border border-ink-300 px-2.5 py-1.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>
    </div>
  );
}
