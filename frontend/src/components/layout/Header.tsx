import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CalendarHeart, LogOut, Menu, User as UserIcon, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { Button } from "../ui/Button.js";
import clsx from "clsx";

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  clsx(
    "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
    isActive ? "text-brand-700 bg-brand-50" : "text-ink-600 hover:text-ink-900 hover:bg-ink-100",
  );

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setMobileOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink-900" onClick={() => setMobileOpen(false)}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <CalendarHeart className="size-5" aria-hidden="true" />
          </span>
          Vitalis Health
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          <NavLink to="/" className={navLinkClasses} end>
            Home
          </NavLink>
          <NavLink to="/doctors" className={navLinkClasses}>
            Find Doctors
          </NavLink>
          {user && (
            <NavLink to="/appointments" className={navLinkClasses}>
              My Appointments
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
              >
                <UserIcon className="size-4" aria-hidden="true" />
                {user.fullName.split(" ")[0]}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-ink-700 hover:text-ink-900">
                Sign in
              </Link>
              <Button size="sm" onClick={() => navigate("/register")}>
                Get Started
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-ink-200 px-4 py-3 md:hidden" aria-label="Primary mobile">
          <div className="flex flex-col gap-1">
            <NavLink to="/" className={navLinkClasses} end onClick={() => setMobileOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/doctors" className={navLinkClasses} onClick={() => setMobileOpen(false)}>
              Find Doctors
            </NavLink>
            {user && (
              <NavLink to="/appointments" className={navLinkClasses} onClick={() => setMobileOpen(false)}>
                My Appointments
              </NavLink>
            )}
            {user ? (
              <>
                <NavLink to="/profile" className={navLinkClasses} onClick={() => setMobileOpen(false)}>
                  Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="mt-1 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
