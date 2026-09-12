import { Loader2 } from "lucide-react";
import clsx from "clsx";

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-ink-500" role="status">
      <Loader2 className={clsx("size-5 animate-spin text-brand-600", className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-ink-500">
      <Loader2 className="size-8 animate-spin text-brand-600" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
