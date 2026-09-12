import { Link, useNavigate, useParams } from "react-router-dom";
import { Briefcase, Globe, MapPin, Star, Stethoscope } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { useDoctor } from "../hooks/useDoctors.js";
import { Avatar } from "../components/ui/Avatar.js";
import { Badge } from "../components/ui/Badge.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { PageSpinner } from "../components/ui/Spinner.js";
import { ErrorState } from "../components/ui/ErrorState.js";
import { formatCurrency } from "../utils/formatters.js";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function groupSchedule(schedule: { dayOfWeek: number; startTime: string; endTime: string }[]) {
  const byDay = new Map<number, string[]>();
  for (const slot of schedule) {
    const existing = byDay.get(slot.dayOfWeek) ?? [];
    existing.push(`${slot.startTime}–${slot.endTime}`);
    byDay.set(slot.dayOfWeek, existing);
  }
  return [...byDay.entries()].sort((a, b) => a[0] - b[0]);
}

export function DoctorDetailsPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: doctor, isLoading, isError, refetch } = useDoctor(doctorId);

  if (isLoading) return <PageSpinner label="Loading doctor profile..." />;

  if (isError || !doctor) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState title="Doctor not found" message="This doctor may no longer be available." onRetry={() => refetch()} />
      </div>
    );
  }

  function handleBookClick() {
    if (!user) {
      navigate("/login", { state: { from: `/book/${doctorId}` } });
      return;
    }
    navigate(`/book/${doctorId}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-500">
        <Link to="/doctors" className="hover:text-ink-800">
          Find Doctors
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-800">{doctor.fullName}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6 sm:p-8">
            <div className="flex flex-col items-start gap-5 sm:flex-row">
              <Avatar src={doctor.photoUrl} name={doctor.fullName} size="xl" />
              <div>
                <h1 className="font-display text-2xl font-bold text-ink-900">{doctor.fullName}</h1>
                <p className="mt-0.5 text-ink-500">{doctor.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Badge tone="brand">{doctor.specialty.name}</Badge>
                  <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                    <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    <span className="font-medium">{doctor.rating.toFixed(1)}</span>
                    <span className="text-ink-400">({doctor.ratingCount} reviews)</span>
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-6 leading-relaxed text-ink-700">{doctor.bio}</p>

            <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-ink-100 pt-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 size-5 text-brand-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-ink-400">Experience</dt>
                  <dd className="font-medium text-ink-800">{doctor.yearsOfExperience} years</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 size-5 text-brand-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-ink-400">Languages</dt>
                  <dd className="font-medium text-ink-800">{doctor.languages.join(", ")}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Stethoscope className="mt-0.5 size-5 text-brand-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-ink-400">Clinic</dt>
                  <dd className="font-medium text-ink-800">{doctor.clinicName}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 text-brand-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-ink-400">Address</dt>
                  <dd className="font-medium text-ink-800">{doctor.clinicAddress}</dd>
                </div>
              </div>
            </dl>
          </Card>

          <Card className="mt-6 p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold text-ink-900">Weekly Availability</h2>
            <div className="mt-4 divide-y divide-ink-100">
              {groupSchedule(doctor.weeklySchedule).map(([day, ranges]) => (
                <div key={day} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium text-ink-700">{DAY_NAMES[day]}</span>
                  <span className="text-ink-500">{ranges.join(", ")}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24 p-6">
            <p className="text-xs text-ink-400">Consultation fee</p>
            <p className="font-display text-3xl font-bold text-ink-900">{formatCurrency(doctor.consultationFee)}</p>
            <p className="mt-1 text-xs text-ink-500">{doctor.slotDurationMinutes}-minute appointment</p>
            <Button fullWidth size="lg" className="mt-6" onClick={handleBookClick}>
              Book Appointment
            </Button>
            <p className="mt-3 text-center text-xs text-ink-400">You can cancel anytime before your visit.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
