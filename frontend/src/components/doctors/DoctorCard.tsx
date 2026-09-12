import { Briefcase, Globe, Star } from "lucide-react";
import { Card } from "../ui/Card.js";
import { Avatar } from "../ui/Avatar.js";
import { Badge } from "../ui/Badge.js";
import { LinkButton } from "../ui/Button.js";
import { formatCurrency } from "../../utils/formatters.js";
import type { DoctorSummary } from "../../types/index.js";

export function DoctorCard({ doctor }: { doctor: DoctorSummary }) {
  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-card-hover">
      <div className="flex items-start gap-4">
        <Avatar src={doctor.photoUrl} name={doctor.fullName} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold text-ink-900">{doctor.fullName}</h3>
          <p className="truncate text-sm text-ink-500">{doctor.title}</p>
          <div className="mt-1 flex items-center gap-1 text-sm text-amber-600">
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-medium">{doctor.rating.toFixed(1)}</span>
            <span className="text-ink-400">({doctor.ratingCount})</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="brand">{doctor.specialty.name}</Badge>
        <span className="inline-flex items-center gap-1 text-xs text-ink-500">
          <Briefcase className="size-3.5" aria-hidden="true" />
          {doctor.yearsOfExperience} yrs experience
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1 text-xs text-ink-500">
        <Globe className="size-3.5" aria-hidden="true" />
        {doctor.languages.join(", ")}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
        <div>
          <p className="text-xs text-ink-400">Consultation fee</p>
          <p className="font-display text-base font-semibold text-ink-900">{formatCurrency(doctor.consultationFee)}</p>
        </div>
        <LinkButton to={`/doctors/${doctor.id}`} size="sm">
          View Profile
        </LinkButton>
      </div>
    </Card>
  );
}
