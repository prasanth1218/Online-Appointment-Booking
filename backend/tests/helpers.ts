import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

export const app = createApp();

export async function resetDatabase() {
  await prisma.appointment.deleteMany();
  await prisma.doctorTimeOff.deleteMany();
  await prisma.weeklyAvailability.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

export async function createTestSpecialty(overrides: Partial<{ name: string; slug: string }> = {}) {
  return prisma.specialty.create({
    data: {
      name: overrides.name ?? "General Medicine",
      slug: overrides.slug ?? "general-medicine",
      description: "Everyday health concerns, checkups and preventive care.",
      icon: "stethoscope",
    },
  });
}

/** Creates a doctor available every day of the week, 09:00-17:00, in 30-minute slots. */
export async function createTestDoctor(specialtyId: string, overrides: Partial<{ fullName: string; slotDurationMinutes: number }> = {}) {
  return prisma.doctor.create({
    data: {
      fullName: overrides.fullName ?? "Dr. Test Physician",
      title: "MD",
      specialtyId,
      bio: "A doctor used only in automated tests.",
      photoUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=test-doctor",
      yearsOfExperience: 10,
      consultationFee: 100,
      languages: ["English"],
      clinicName: "Test Clinic",
      clinicAddress: "1 Test Street",
      slotDurationMinutes: overrides.slotDurationMinutes ?? 30,
      rating: 4.5,
      ratingCount: 10,
      availabilities: {
        create: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
          dayOfWeek,
          startTime: "09:00",
          endTime: "17:00",
        })),
      },
    },
  });
}

export async function registerAndLogin(emailSuffix = "1") {
  const email = `patient.${emailSuffix}@example.com`;
  const response = await request(app).post("/api/auth/register").send({
    fullName: "Patient Tester",
    email,
    password: "Passw0rd!",
  });
  return {
    email,
    accessToken: response.body.data.accessToken as string,
    userId: response.body.data.user.id as string,
    refreshCookie: response.headers["set-cookie"],
  };
}

/**
 * Returns a YYYY-MM-DD string N days from today, computed from local
 * wall-clock date fields — matching todayCalendarDate() in src/utils/time.ts
 * so tests agree with the app on what "today" and "+N days" mean.
 */
export function daysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
