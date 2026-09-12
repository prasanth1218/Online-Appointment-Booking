import { Link, useParams } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock, MapPin, Stethoscope } from "lucide-react";
import { useAppointment } from "../hooks/useAppointments.js";
import { Card } from "../components/ui/Card.js";
import { LinkButton } from "../components/ui/Button.js";
import { PageSpinner } from "../components/ui/Spinner.js";
import { ErrorState } from "../components/ui/ErrorState.js";
import { formatDateTime } from "../utils/formatters.js";

export function ConfirmationPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { data: appointment, isLoading, isError, refetch } = useAppointment(appointmentId);

  if (isLoading) return <PageSpinner label="Loading confirmation..." />;

  if (isError || !appointment) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState title="Couldn't load appointment" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-9 text-emerald-600" aria-hidden="true" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-ink-900">Appointment Confirmed!</h1>
        <p className="mt-2 text-ink-500">
          We've sent the details to {appointment.patientEmail}. Here's a summary of your visit.
        </p>
      </div>

      <Card className="mt-8 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-ink-100 pb-4">
          <span className="text-xs uppercase tracking-wide text-ink-400">Appointment ID</span>
          <span className="font-mono text-sm font-medium text-ink-700">{appointment.id.slice(0, 12)}</span>
        </div>

        <dl className="grid gap-5 pt-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Stethoscope className="mt-0.5 size-5 text-brand-600" aria-hidden="true" />
            <div>
              <dt className="text-xs text-ink-400">Doctor</dt>
              <dd className="font-medium text-ink-800">{appointment.doctor.fullName}</dd>
              <dd className="text-sm text-ink-500">{appointment.doctor.specialtyName}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-5 text-brand-600" aria-hidden="true" />
            <div>
              <dt className="text-xs text-ink-400">Date & time</dt>
              <dd className="font-medium text-ink-800">{formatDateTime(appointment.date, appointment.startTime)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 text-brand-600" aria-hidden="true" />
            <div>
              <dt className="text-xs text-ink-400">Location</dt>
              <dd className="font-medium text-ink-800">{appointment.doctor.clinicName}</dd>
              <dd className="text-sm text-ink-500">{appointment.doctor.clinicAddress}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 text-brand-600" aria-hidden="true" />
            <div>
              <dt className="text-xs text-ink-400">Reason for visit</dt>
              <dd className="font-medium text-ink-800">{appointment.reasonForVisit}</dd>
            </div>
          </div>
        </dl>
      </Card>

      <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-5 text-sm text-brand-800">
        <p className="font-medium">What happens next?</p>
        <p className="mt-1">
          Please arrive 10 minutes early with any relevant medical records. You can view or cancel this appointment
          anytime from My Appointments.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <LinkButton to={`/appointments/${appointment.id}`} fullWidth variant="outline">
          View Appointment
        </LinkButton>
        <LinkButton to="/appointments" fullWidth>
          Go to My Appointments
        </LinkButton>
      </div>
      <div className="mt-3 text-center">
        <Link to="/" className="text-sm text-ink-500 hover:text-ink-800">
          Return Home
        </Link>
      </div>
    </div>
  );
}
