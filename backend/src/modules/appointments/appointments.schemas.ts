import { z } from "zod";
import { isValidTimeString } from "../../utils/time.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const createAppointmentSchema = z.object({
  doctorId: z.string().uuid("Invalid doctor id."),
  date: z
    .string()
    .regex(DATE_PATTERN, "date must be in YYYY-MM-DD format.")
    .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()), "date is not a valid calendar date."),
  startTime: z.string().refine(isValidTimeString, "startTime must be in HH:mm format."),
  reasonForVisit: z.string().trim().min(3, "Please briefly describe the reason for your visit.").max(300),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  patientFullName: z.string().trim().min(2, "Full name must be at least 2 characters.").max(120),
  patientEmail: z.email("Enter a valid email address.").trim().toLowerCase(),
  patientPhone: z
    .string()
    .trim()
    .regex(/^[0-9+()\-\s]{7,20}$/, "Enter a valid phone number."),
});

export const listAppointmentsQuerySchema = z.object({
  filter: z.enum(["upcoming", "past", "cancelled", "all"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const appointmentIdParamSchema = z.object({
  id: z.string().uuid("Invalid appointment id."),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().trim().max(300).optional().or(z.literal("")),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
