import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Card } from "../ui/Card.js";
import { Avatar } from "../ui/Avatar.js";
import { LinkButton } from "../ui/Button.js";
import { Button } from "../ui/Button.js";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge.js";
import { formatShortDate, formatTime } from "../../utils/formatters.js";
import type { Appointment } from "../../types/index.js";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (appointment: Appointment) => void;
}

export function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
  const canCancel = appointment.displayStatus === "upcoming";

  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <Avatar src={appointment.doctor.photoUrl} name={appointment.doctor.fullName} size="md" />
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-ink-900">{appointment.doctor.fullName}</p>
            <AppointmentStatusBadge status={appointment.displayStatus} />
          </div>
          <p className="text-sm text-ink-500">{appointment.doctor.specialtyName}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-ink-400" aria-hidden="true" />
              {formatShortDate(appointment.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-ink-400" aria-hidden="true" />
              {formatTime(appointment.startTime)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-ink-400" aria-hidden="true" />
              {appointment.doctor.clinicName}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-400">ID: {appointment.id.slice(0, 12)}</p>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 sm:flex-col">
        <LinkButton to={`/appointments/${appointment.id}`} variant="outline" size="sm">
          View Details
        </LinkButton>
        {canCancel && onCancel && (
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => onCancel(appointment)}>
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}
