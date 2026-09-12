import { Link } from "react-router-dom";
import { CalendarHeart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div>
            <div className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <CalendarHeart className="size-4" aria-hidden="true" />
              </span>
              Vitalis Health
            </div>
            <p className="mt-2 max-w-xs text-sm text-ink-500">
              Book trusted doctors in minutes. Demo product — for illustration purposes only, not a real clinic.
            </p>
          </div>

          <nav className="flex gap-8 text-sm" aria-label="Footer">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-ink-800">Platform</span>
              <Link to="/doctors" className="text-ink-500 hover:text-ink-800">
                Find Doctors
              </Link>
              <Link to="/appointments" className="text-ink-500 hover:text-ink-800">
                My Appointments
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-ink-800">Account</span>
              <Link to="/login" className="text-ink-500 hover:text-ink-800">
                Sign In
              </Link>
              <Link to="/register" className="text-ink-500 hover:text-ink-800">
                Create Account
              </Link>
            </div>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-ink-100 pt-6 text-xs text-ink-400 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Vitalis Health. All rights reserved.</p>
          <p>Built as a demonstration project — all doctors and data are fictional.</p>
        </div>
      </div>
    </footer>
  );
}
