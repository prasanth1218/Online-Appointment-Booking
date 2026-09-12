import { z } from "zod";

export const listDoctorsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  specialtySlug: z.string().trim().max(120).optional(),
  sortBy: z.enum(["rating", "experience", "feeAsc", "feeDesc"]).default("rating"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const doctorIdParamSchema = z.object({
  id: z.string().uuid("Invalid doctor id."),
});

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const availabilityQuerySchema = z.object({
  date: z
    .string()
    .regex(DATE_PATTERN, "date must be in YYYY-MM-DD format.")
    .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()), "date is not a valid calendar date."),
});

export type ListDoctorsQuery = z.infer<typeof listDoctorsQuerySchema>;
