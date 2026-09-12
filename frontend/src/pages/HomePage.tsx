import { Link } from "react-router-dom";
import {
  CalendarCheck2,
  ClipboardList,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useSpecialties } from "../hooks/useSpecialties.js";
import { useDoctors } from "../hooks/useDoctors.js";
import { DoctorCard } from "../components/doctors/DoctorCard.js";
import { DoctorCardSkeleton } from "../components/ui/Skeleton.js";
import { Card } from "../components/ui/Card.js";

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: "Find the right doctor",
    description: "Browse by specialty, search by name, and compare experience, ratings and fees.",
  },
  {
    icon: CalendarCheck2,
    title: "Pick a date & time",
    description: "See real-time availability and choose a slot that works for your schedule.",
  },
  {
    icon: ClipboardList,
    title: "Confirm your details",
    description: "Tell us the reason for your visit — we'll handle the rest.",
  },
  {
    icon: Sparkles,
    title: "Get instant confirmation",
    description: "Receive an appointment ID and manage or cancel anytime from your account.",
  },
];

const BENEFITS = [
  { icon: ShieldCheck, title: "Verified specialists", description: "Every doctor profile is reviewed for accuracy before it goes live." },
  { icon: CalendarCheck2, title: "Real-time availability", description: "No back-and-forth calls — see exactly which slots are open." },
  { icon: UserRound, title: "Built around you", description: "Manage upcoming, past and cancelled visits in one simple dashboard." },
];

export function HomePage() {
  const { data: specialties, isLoading: specialtiesLoading } = useSpecialties();
  const { data: featuredDoctors, isLoading: doctorsLoading } = useDoctors({ sortBy: "rating", limit: 3 });

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24 lg:px-8">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Trusted by 12,000+ patients
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
              Book the right doctor, <span className="text-brand-600">right on time.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-ink-600">
              Vitalis Health connects you with experienced doctors across every specialty. Search, compare and
              book an appointment in under two minutes — no phone calls required.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/doctors"
                className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                Find a Doctor
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl border border-ink-300 bg-white px-6 py-3.5 text-base font-semibold text-ink-800 transition-colors hover:bg-ink-100"
              >
                Create Free Account
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-ink-500">
              <div className="flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="font-semibold text-ink-800">4.8/5</span> average rating
              </div>
              <div className="flex items-center gap-1.5">
                <Stethoscope className="size-4 text-brand-600" aria-hidden="true" />
                <span className="font-semibold text-ink-800">12</span> specialties
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <Card className="animate-fade-in ml-auto max-w-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Upcoming Appointment</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Stethoscope className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display font-semibold text-ink-900">Dr. Amara Okafor</p>
                  <p className="text-sm text-ink-500">Cardiology</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3 text-sm">
                <span className="text-ink-500">Fri, Sep 19</span>
                <span className="font-semibold text-ink-800">10:00 AM</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                Confirmed
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-ink-900">How booking works</h2>
          <p className="mt-2 text-ink-500">Four simple steps from search to confirmation.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, index) => (
            <div key={step.title} className="relative rounded-2xl border border-ink-200 bg-white p-6">
              <span className="absolute -top-3 left-6 flex size-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              <step.icon className="size-7 text-brand-600" aria-hidden="true" />
              <h3 className="mt-4 font-display font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-white">Browse by specialty</h2>
              <p className="mt-2 text-ink-300">Find specialists across every major area of care.</p>
            </div>
            <Link to="/doctors" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
              View all doctors &rarr;
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {specialtiesLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-white/10" />
              ))}
            {specialties?.map((specialty) => (
              <Link
                key={specialty.id}
                to={`/doctors?specialty=${specialty.slug}`}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white transition-colors hover:border-brand-400 hover:bg-white/10"
              >
                <p className="font-medium">{specialty.name}</p>
                <p className="mt-0.5 text-xs text-ink-300">{specialty.doctorCount} doctors</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink-900">Top-rated doctors</h2>
            <p className="mt-2 text-ink-500">Highly reviewed specialists ready to see you.</p>
          </div>
          <Link to="/doctors" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            View all doctors &rarr;
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctorsLoading && Array.from({ length: 3 }).map((_, i) => <DoctorCardSkeleton key={i} />)}
          {featuredDoctors?.doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
        </div>
      </section>

      <section className="border-t border-ink-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold text-ink-900">Why patients choose Vitalis</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-100">
                  <benefit.icon className="size-6 text-brand-700" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-ink-900">{benefit.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand-600 px-8 py-14">
          <h2 className="font-display text-3xl font-bold text-white">Ready to book your appointment?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Join thousands of patients who found the right care, faster.
          </p>
          <Link
            to="/doctors"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
          >
            Browse Doctors
          </Link>
        </div>
      </section>
    </div>
  );
}
