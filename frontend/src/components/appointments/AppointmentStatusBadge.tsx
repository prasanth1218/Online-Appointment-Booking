import { Badge } from "../ui/Badge.js";
import type { AppointmentDisplayStatus } from "../../types/index.js";

const STATUS_CONFIG: Record<AppointmentDisplayStatus, { label: string; tone: "brand" | "success" | "warning" | "danger" | "neutral" }> = {
  upcoming: { label: "Upcoming", tone: "brand" },
  completed: { label: "Completed", tone: "success" },
  past: { label: "Past", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentDisplayStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
