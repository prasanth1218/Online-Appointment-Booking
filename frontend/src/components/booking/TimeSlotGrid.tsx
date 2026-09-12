import clsx from "clsx";
import { CalendarX } from "lucide-react";
import { formatTime } from "../../utils/formatters.js";
import type { TimeSlot } from "../../types/index.js";

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelect: (startTime: string) => void;
  isDayOff: boolean;
}

function groupByPeriod(slots: TimeSlot[]) {
  const morning = slots.filter((s) => Number(s.startTime.slice(0, 2)) < 12);
  const afternoon = slots.filter((s) => {
    const hour = Number(s.startTime.slice(0, 2));
    return hour >= 12 && hour < 17;
  });
  const evening = slots.filter((s) => Number(s.startTime.slice(0, 2)) >= 17);
  return { morning, afternoon, evening };
}

function SlotSection({
  label,
  slots,
  selectedTime,
  onSelect,
}: {
  label: string;
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelect: (t: string) => void;
}) {
  if (slots.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</h4>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.startTime;
          return (
            <button
              key={slot.startTime}
              type="button"
              disabled={!slot.available}
              aria-pressed={isSelected}
              onClick={() => onSelect(slot.startTime)}
              className={clsx(
                "rounded-lg border px-2 py-2.5 text-sm font-medium transition-colors",
                !slot.available && "cursor-not-allowed border-ink-100 bg-ink-50 text-ink-300 line-through",
                slot.available &&
                  !isSelected &&
                  "border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:bg-brand-50",
                slot.available && isSelected && "border-brand-600 bg-brand-600 text-white shadow-sm",
              )}
            >
              {formatTime(slot.startTime)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimeSlotGrid({ slots, selectedTime, onSelect, isDayOff }: TimeSlotGridProps) {
  if (isDayOff || slots.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ink-300 bg-ink-50/50 px-4 py-10 text-center">
        <CalendarX className="size-6 text-ink-400" aria-hidden="true" />
        <p className="text-sm font-medium text-ink-600">
          {isDayOff ? "The doctor is unavailable on this date." : "No slots are configured for this date."}
        </p>
        <p className="text-xs text-ink-400">Please choose another date.</p>
      </div>
    );
  }

  const { morning, afternoon, evening } = groupByPeriod(slots);
  const hasAvailable = slots.some((s) => s.available);

  return (
    <div className="flex flex-col gap-5">
      {!hasAvailable && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          All slots are booked for this date. Please try another date.
        </p>
      )}
      <SlotSection label="Morning" slots={morning} selectedTime={selectedTime} onSelect={onSelect} />
      <SlotSection label="Afternoon" slots={afternoon} selectedTime={selectedTime} onSelect={onSelect} />
      <SlotSection label="Evening" slots={evening} selectedTime={selectedTime} onSelect={onSelect} />
    </div>
  );
}
