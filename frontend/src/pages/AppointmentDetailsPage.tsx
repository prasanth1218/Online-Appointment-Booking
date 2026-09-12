import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Clock, Mail, MapPin, Phone, Stethoscope, User as UserIcon } from "lucide-react";
import { useAppointment, useCancelAppointment } from "../hooks/useAppointments.js";
import { AppointmentStatusBadge } from "../components/appointments/AppointmentStatusBadge.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Avatar } from "../components/ui/Avatar.js";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.js";
import { PageSpinner } from "../components/ui/Spinner.js";
import { ErrorState } from "../components/ui/ErrorState.js";
import { formatDateTime } from "../utils/formatters.js";

export function AppointmentDetailsPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { data: appointment, isLoading, isError, refetch } = useAppointment(appointmentId);
  const cancelAppointment = useCancelAppointment();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <PageSpinner label="Loading appointment..." />;

  if (isError || !appointment) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState title="Appointment not found" onRetry={() => refetch()} />
      </div>
    );
  }

  async function handleCancel() {
    if (!appointment) return;
    await cancelAppointment.mutateAsync({ id: appointment.id });
    setConfirmOpen(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-500">
        <Link to="/appointments" className="hover:text-ink-800">
          My Appointments
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-800">Details</span>
      </nav>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <Avatar src={appointment.doctor.photoUrl} name={appointment.doctor.fullName} size="lg" />
            <div>
              <h1 className="font-display text-xl font-bold text-ink-900">{appointment.doctor.fullName}</h1>
              <p className="text-sm text-ink-500">{appointment.doctor.specialtyName}</p>
            </div>
          </div>
          <AppointmentStatusBadge status={appointment.displayStatus} />
        </div>

        <dl className="mt-6 grid gap-5 border-t border-ink-100 pt-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-5 text-brand-600" aria-hidden="true" />
            <div>
              <dt className="text-xs text-ink-400">Date & time</dt>
              <dd className="font-medium text-ink-800">{formatDateTime(appointment.date, appointment.startTime)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 text-brand-600" aria-hidden="true" />
            <div>
              <dt className="text-xs text-ink-400">Duration</dt>
              <dd className="font-medium text-ink-800">
                {appointment.startTime} – {appointment.endTime}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 text-brand-600" aria-hidden="true" />
            <div>
              <dt className="text-xs text-ink-400">Clinic</dt>
              <dd className="font-medium text-ink-800">{appointment.doctor.clinicName}</dd>
              <dd className="text-sm text-ink-500">{appointment.doctor.clinicAddress}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Stethoscope className="mt-0.5 size-5 text-brand-600" aria-hidden="true" />
            <div>
              <dt className="text-xs text-ink-400">Reason for visit</dt>
              <dd className="font-medium text-ink-800">{appointment.reasonForVisit}</dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 border-t border-ink-100 pt-6">
          <h2 className="mb-3 text-sm font-semibold text-ink-700">Patient information</h2>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="size-4 text-ink-400" aria-hidden="true" />
              {appointment.patientFullName}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-ink-400" aria-hidden="true" />
              {appointment.patientEmail}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="size-4 text-ink-400" aria-hidden="true" />
              {appointment.patientPhone}
            </div>
          </dl>
          {appointment.notes && (
            <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600">
              <span className="font-medium text-ink-700">Notes: </span>
              {appointment.notes}
            </p>
          )}
        </div>

        {appointment.displayStatus === "cancelled" && appointment.cancellationReason && (
          <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <span className="font-medium">Cancellation reason: </span>
            {appointment.cancellationReason}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-ink-100 pt-6">
          <Button variant="outline" onClick={() => navigate("/appointments")}>
            Back to My Appointments
          </Button>
          {appointment.displayStatus === "upcoming" && (
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Cancel Appointment
            </Button>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this appointment?"
        description="This will cancel your appointment and free up the slot for other patients. This cannot be undone."
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Appointment"
        danger
        isConfirming={cancelAppointment.isPending}
        onConfirm={handleCancel}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
