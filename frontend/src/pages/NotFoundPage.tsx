import { CompassIcon } from "lucide-react";
import { LinkButton } from "../components/ui/Button.js";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-lg flex-col items-center justify-center px-4 text-center sm:px-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-brand-100">
        <CompassIcon className="size-8 text-brand-600" aria-hidden="true" />
      </div>
      <h1 className="mt-6 font-display text-4xl font-bold text-ink-900">404</h1>
      <p className="mt-2 text-lg font-medium text-ink-800">Page not found</p>
      <p className="mt-2 text-ink-500">The page you're looking for doesn't exist or may have moved.</p>
      <LinkButton to="/" className="mt-6">
        Back to Home
      </LinkButton>
    </div>
  );
}
