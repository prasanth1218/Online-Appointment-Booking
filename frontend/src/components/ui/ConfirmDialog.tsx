import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button.js";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Uses the native <dialog> element: it gives us a focus trap, Escape-to-close
 * and top-layer stacking for free, without a modal library dependency.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isConfirming,
  danger,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-ink-200 bg-white p-0 shadow-xl backdrop:bg-ink-900/40"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {danger && (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-5 text-red-500" aria-hidden="true" />
            </div>
          )}
          <div>
            <h2 id="confirm-dialog-title" className="font-display text-lg font-semibold text-ink-900">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-ink-600">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} isLoading={isConfirming}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
