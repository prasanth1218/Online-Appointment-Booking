export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  role: "PATIENT" | "ADMIN";
  createdAt: string;
}

export interface Specialty {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  doctorCount: number;
}

export interface DoctorSummary {
  id: string;
  fullName: string;
  title: string;
  photoUrl: string;
  yearsOfExperience: number;
  consultationFee: number;
  languages: string[];
  clinicName: string;
  rating: number;
  ratingCount: number;
  specialty: { id: string; name: string; slug: string };
}

export interface DoctorDetail extends DoctorSummary {
  bio: string;
  clinicAddress: string;
  slotDurationMinutes: number;
  weeklySchedule: { dayOfWeek: number; startTime: string; endTime: string }[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityResponse {
  doctorId: string;
  date: string;
  isDayOff: boolean;
  slots: TimeSlot[];
}

export type AppointmentStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
export type AppointmentDisplayStatus = "upcoming" | "past" | "cancelled" | "completed";

export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  displayStatus: AppointmentDisplayStatus;
  reasonForVisit: string;
  notes: string | null;
  patientFullName: string;
  patientEmail: string;
  patientPhone: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  doctor: {
    id: string;
    fullName: string;
    title: string;
    photoUrl: string;
    clinicName: string;
    clinicAddress: string;
    specialtyName: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { pagination?: PaginationMeta };
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
