import { Check } from "lucide-react";
import clsx from "clsx";

export interface Step {
  key: string;
  label: string;
}

export function StepIndicator({ steps, currentIndex }: { steps: Step[]; currentIndex: number }) {
  return (
    <ol className="flex items-center" aria-label="Booking progress">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step.key} className={clsx("flex items-center", index < steps.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={clsx(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isComplete && "border-brand-600 bg-brand-600 text-white",
                  isCurrent && "border-brand-600 bg-white text-brand-700",
                  !isComplete && !isCurrent && "border-ink-200 bg-white text-ink-400",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isComplete ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </div>
              <span
                className={clsx(
                  "hidden text-xs font-medium sm:block",
                  isCurrent || isComplete ? "text-ink-800" : "text-ink-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={clsx("mx-2 h-0.5 flex-1 rounded", isComplete ? "bg-brand-600" : "bg-ink-200")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
