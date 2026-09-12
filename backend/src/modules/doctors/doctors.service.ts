import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { computeAvailableSlots } from "../../utils/slots.js";
import { todayCalendarDate } from "../../utils/time.js";
import type { ListDoctorsQuery } from "./doctors.schemas.js";

const MAX_BOOKING_HORIZON_DAYS = 60;

function toDoctorSummary(doctor: {
  id: string;
  fullName: string;
  title: string;
  photoUrl: string;
  yearsOfExperience: number;
  consultationFee: Prisma.Decimal;
  languages: string[];
  clinicName: string;
  rating: Prisma.Decimal;
  ratingCount: number;
  specialty: { id: string; name: string; slug: string };
}) {
  return {
    id: doctor.id,
    fullName: doctor.fullName,
    title: doctor.title,
    photoUrl: doctor.photoUrl,
    yearsOfExperience: doctor.yearsOfExperience,
    consultationFee: Number(doctor.consultationFee),
    languages: doctor.languages,
    clinicName: doctor.clinicName,
    rating: Number(doctor.rating),
    ratingCount: doctor.ratingCount,
    specialty: doctor.specialty,
  };
}

export async function listDoctors(query: ListDoctorsQuery) {
  const where: Prisma.DoctorWhereInput = {
    isActive: true,
    ...(query.search
      ? {
          OR: [
            { fullName: { contains: query.search, mode: "insensitive" } },
            { specialty: { name: { contains: query.search, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(query.specialtySlug ? { specialty: { slug: query.specialtySlug } } : {}),
  };

  const orderBy: Prisma.DoctorOrderByWithRelationInput =
    query.sortBy === "experience"
      ? { yearsOfExperience: "desc" }
      : query.sortBy === "feeAsc"
        ? { consultationFee: "asc" }
        : query.sortBy === "feeDesc"
          ? { consultationFee: "desc" }
          : { rating: "desc" };

  const [total, doctors] = await Promise.all([
    prisma.doctor.count({ where }),
    prisma.doctor.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: { specialty: { select: { id: true, name: true, slug: true } } },
    }),
  ]);

  return {
    doctors: doctors.map(toDoctorSummary),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getDoctorById(id: string) {
  const doctor = await prisma.doctor.findFirst({
    where: { id, isActive: true },
    include: {
      specialty: { select: { id: true, name: true, slug: true } },
      availabilities: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
    },
  });

  if (!doctor) {
    throw AppError.notFound("Doctor not found.");
  }

  return {
    ...toDoctorSummary(doctor),
    bio: doctor.bio,
    clinicAddress: doctor.clinicAddress,
    slotDurationMinutes: doctor.slotDurationMinutes,
    weeklySchedule: doctor.availabilities.map((a) => ({
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
  };
}

export async function getDoctorAvailability(doctorId: string, date: string) {
  const doctor = await prisma.doctor.findFirst({
    where: { id: doctorId, isActive: true },
    include: { availabilities: true },
  });

  if (!doctor) {
    throw AppError.notFound("Doctor not found.");
  }

  const today = todayCalendarDate();
  if (date < today) {
    throw AppError.badRequest("Cannot check availability for a past date.");
  }

  const horizon = new Date(`${today}T00:00:00Z`);
  horizon.setUTCDate(horizon.getUTCDate() + MAX_BOOKING_HORIZON_DAYS);
  if (new Date(`${date}T00:00:00Z`) > horizon) {
    throw AppError.badRequest(`Cannot check availability more than ${MAX_BOOKING_HORIZON_DAYS} days in advance.`);
  }

  const parsedDate = new Date(`${date}T00:00:00Z`);

  const [timeOff, existingAppointments] = await Promise.all([
    prisma.doctorTimeOff.findUnique({ where: { doctorId_date: { doctorId, date: parsedDate } } }),
    prisma.appointment.findMany({
      where: { doctorId, date: parsedDate, status: { not: "CANCELLED" } },
      select: { startTime: true },
    }),
  ]);

  const slots = computeAvailableSlots({
    date,
    templateRows: doctor.availabilities,
    slotDurationMinutes: doctor.slotDurationMinutes,
    bookedStartTimes: new Set(existingAppointments.map((a) => a.startTime)),
    isDayOff: Boolean(timeOff),
  });

  return {
    doctorId,
    date,
    isDayOff: Boolean(timeOff),
    slots,
  };
}
