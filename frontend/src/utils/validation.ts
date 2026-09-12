import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(72, "Password must be at most 72 characters long.")
  .regex(/[A-Za-z]/, "Password must contain at least one letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required.")
  .regex(/^[0-9+()\-\s]{7,20}$/, "Enter a valid phone number.");

export const registerFormSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters.").max(120),
    email: z.email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters.").max(120),
  phone: z.string().trim().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const patientDetailsFormSchema = z.object({
  patientFullName: z.string().trim().min(2, "Full name must be at least 2 characters.").max(120),
  patientEmail: z.email("Enter a valid email address."),
  patientPhone: phoneSchema,
  reasonForVisit: z.string().trim().min(3, "Please briefly describe the reason for your visit.").max(300),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type PatientDetailsFormValues = z.infer<typeof patientDetailsFormSchema>;
