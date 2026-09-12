import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarX2 } from "lucide-react";
import clsx from "clsx";
import { useAppointments, useCancelAppointment, type AppointmentFilter } from "../hooks/useAppointments.js";
import { AppointmentCard } from "../components/appointments/AppointmentCard.js";
import { EmptyState } from "../components/ui/EmptyState.js";
import { ErrorState } from "../components/ui/ErrorState.js";
import { Button } from "../components/ui/Button.js";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.js";
import { Skeleton } from "../components/ui/Skeleton.js";
import type { Appointment } from "../types/index.js";

const TABS: { key: AppointmentFilter; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

export function MyAppointmentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (searchParams.get("tab") as AppointmentFilter) ?? "upcoming";
  const page = Number(searchParams.get("page") ?? "1");

  const { data, isLoading, isError, refetch } = useAppointments(filter, page);
  const cancelAppointment = useCancelAppointment();
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  function setTab(tab: AppointmentFilter) {
    setSearchParams({ tab });
  }

  async function confirmCancel() {
    if (!appointmentToCancel) return;
    await cancelAppointment.mutateAsync({ id: appointmentToCancel.id });
    setAppointmentToCancel(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink-900">My Appointments</h1>
      <p className="mt-2 text-ink-500">View and manage your upcoming, past and cancelled visits.</p>

      <div className="mt-6 flex gap-1 border-b border-ink-200" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={filter === tab.key}
            onClick={() => setTab(tab.key)}
            className={clsx(
              "px-4 py-2.5 text-sm font-medium transition-colors",
              filter === tab.key
                ? "border-b-2 border-brand-600 text-brand-700"
                : "border-b-2 border-transparent text-ink-500 hover:text-ink-800",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}

        {isError && <ErrorState message="We couldn't load your appointments." onRetry={() => refetch()} />}

        {!isLoading && !isError && data?.appointments.length === 0 && (
          <EmptyState
            icon={CalendarX2}
            title={`No ${filter} appointments`}
            description={
              filter === "upcoming"
                ? "You don't have any upcoming visits. Book one whenever you're ready."
                : `You don't have any ${filter} appointments yet.`
            }
            action={
              filter === "upcoming" ? (
                <Button size="sm" onClick={() => navigate("/doctors")}>
                  Find a Doctor
                </Button>
              ) : undefined
            }
          />
        )}

        {!isLoading &&
          !isError &&
          data?.appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} onCancel={setAppointmentToCancel} />
          ))}

        {data && data.pagination.totalPages > 1 && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setSearchParams({ tab: filter, page: String(page - 1) })}
            >
              Previous
            </Button>
            <span className="text-sm text-ink-500">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setSearchParams({ tab: filter, page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(appointmentToCancel)}
        title="Cancel this appointment?"
        description={
          appointmentToCancel
            ? `This will cancel your appointment with ${appointmentToCancel.doctor.fullName} on ${appointmentToCancel.date}. This cannot be undone.`
            : ""
        }
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Appointment"
        danger
        isConfirming={cancelAppointment.isPending}
        onConfirm={confirmCancel}
        onClose={() => setAppointmentToCancel(null)}
      />
    </div>
  );
}
