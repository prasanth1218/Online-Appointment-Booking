import { Prisma, type Appointment } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { computeAvailableSlots } from "../../utils/slots.js";
import { timeToMinutes, todayCalendarDate, nowMinutesOfDay } from "../../utils/time.js";
import type { CreateAppointmentInput, ListAppointmentsQuery } from "./appointments.schemas.js";

function toPublicAppointment(
  appointment: Appointment & {
    doctor: { id: string; fullName: string; title: string; photoUrl: string; clinicName: string; clinicAddress: string; specialty: { name: string } };
  },
) {
  const today = todayCalendarDate();
  const dateStr = appointment.date.toISOString().slice(0, 10);
  const isPastByTime =
    dateStr < today || (dateStr === today && timeToMinutes(appointment.startTime) < nowMinutesOfDay());

  const displayStatus: "upcoming" | "past" | "cancelled" | "completed" =
    appointment.status === "CANCELLED"
      ? "cancelled"
      : appointment.status === "COMPLETED"
        ? "completed"
        : isPastByTime
          ? "past"
          : "upcoming";

  return {
    id: appointment.id,
    date: dateStr,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    displayStatus,
    reasonForVisit: appointment.reasonForVisit,
    notes: appointment.notes,
    patientFullName: appointment.patientFullName,
    patientEmail: appointment.patientEmail,
    patientPhone: appointment.patientPhone,
    cancelledAt: appointment.cancelledAt ? appointment.cancelledAt.toISOString() : null,
    cancellationReason: appointment.cancellationReason,
    createdAt: appointment.createdAt.toISOString(),
    doctor: {
      id: appointment.doctor.id,
      fullName: appointment.doctor.fullName,
      title: appointment.doctor.title,
      photoUrl: appointment.doctor.photoUrl,
      clinicName: appointment.doctor.clinicName,
      clinicAddress: appointment.doctor.clinicAddress,
      specialtyName: appointment.doctor.specialty.name,
    },
  };
}

const appointmentInclude = {
  doctor: {
    include: { specialty: { select: { name: true } } },
  },
} satisfies Prisma.AppointmentInclude;

export async function createAppointment(patientId: string, input: CreateAppointmentInput) {
  const doctor = await prisma.doctor.findFirst({
    where: { id: input.doctorId, isActive: true },
    include: { availabilities: true },
  });

  if (!doctor) {
    throw AppError.notFound("Doctor not found.");
  }

  const today = todayCalendarDate();
  if (input.date < today) {
    throw AppError.badRequest("Cannot book an appointment in the past.");
  }

  const appointmentDate = new Date(`${input.date}T00:00:00Z`);

  const [timeOff, sameSlotAppointment, patientConflict] = await Promise.all([
    prisma.doctorTimeOff.findUnique({ where: { doctorId_date: { doctorId: input.doctorId, date: appointmentDate } } }),
    prisma.appointment.findFirst({
      where: { doctorId: input.doctorId, date: appointmentDate, startTime: input.startTime, status: { not: "CANCELLED" } },
    }),
    prisma.appointment.findFirst({
      where: { patientId, date: appointmentDate, startTime: input.startTime, status: { not: "CANCELLED" } },
    }),
  ]);

  if (timeOff) {
    throw AppError.conflict("The doctor is unavailable on this date.");
  }
  if (sameSlotAppointment) {
    throw AppError.conflict("This time slot has just been booked by someone else. Please choose another slot.");
  }
  if (patientConflict) {
    throw AppError.conflict("You already have another appointment booked at this exact date and time.");
  }

  const existingAppointments = await prisma.appointment.findMany({
    where: { doctorId: input.doctorId, date: appointmentDate, status: { not: "CANCELLED" } },
    select: { startTime: true },
  });

  const slots = computeAvailableSlots({
    date: input.date,
    templateRows: doctor.availabilities,
    slotDurationMinutes: doctor.slotDurationMinutes,
    bookedStartTimes: new Set(existingAppointments.map((a) => a.startTime)),
    isDayOff: false,
  });

  const matchingSlot = slots.find((slot) => slot.startTime === input.startTime);
  if (!matchingSlot) {
    throw AppError.badRequest("The selected time is not a valid appointment slot for this doctor.");
  }
  if (!matchingSlot.available) {
    throw AppError.conflict("This time slot is no longer available. Please choose another slot.");
  }

  try {
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId: input.doctorId,
        date: appointmentDate,
        startTime: input.startTime,
        endTime: matchingSlot.endTime,
        reasonForVisit: input.reasonForVisit,
        notes: input.notes || null,
        patientFullName: input.patientFullName,
        patientEmail: input.patientEmail,
        patientPhone: input.patientPhone,
      },
      include: appointmentInclude,
    });
    return toPublicAppointment(appointment);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw AppError.conflict("This time slot has just been booked by someone else. Please choose another slot.");
    }
    throw error;
  }
}

export async function listAppointments(patientId: string, query: ListAppointmentsQuery) {
  const today = todayCalendarDate();
  const nowMinutes = nowMinutesOfDay();
  const todayDate = new Date(`${today}T00:00:00Z`);
  const currentTime = `${String(Math.floor(nowMinutes / 60)).padStart(2, "0")}:${String(nowMinutes % 60).padStart(2, "0")}`;

  const where: Prisma.AppointmentWhereInput = { patientId };

  if (query.filter === "cancelled") {
    where.status = "CANCELLED";
  } else if (query.filter === "upcoming") {
    where.status = "CONFIRMED";
    where.OR = [{ date: { gt: todayDate } }, { date: todayDate, startTime: { gte: currentTime } }];
  } else if (query.filter === "past") {
    where.status = { in: ["CONFIRMED", "COMPLETED"] };
    where.OR = [{ date: { lt: todayDate } }, { date: todayDate, startTime: { lt: currentTime } }, { status: "COMPLETED" }];
  }

  const orderBy: Prisma.AppointmentOrderByWithRelationInput[] =
    query.filter === "upcoming" ? [{ date: "asc" }, { startTime: "asc" }] : [{ date: "desc" }, { startTime: "desc" }];

  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: appointmentInclude,
    }),
  ]);

  return {
    appointments: appointments.map(toPublicAppointment),
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) },
  };
}

export async function getAppointmentById(patientId: string, id: string) {
  const appointment = await prisma.appointment.findFirst({
    where: { id, patientId },
    include: appointmentInclude,
  });

  if (!appointment) {
    throw AppError.notFound("Appointment not found.");
  }

  return toPublicAppointment(appointment);
}

export async function cancelAppointment(patientId: string, id: string, reason: string | undefined) {
  const appointment = await prisma.appointment.findFirst({ where: { id, patientId } });

  if (!appointment) {
    throw AppError.notFound("Appointment not found.");
  }
  if (appointment.status === "CANCELLED") {
    throw AppError.badRequest("This appointment has already been cancelled.");
  }
  if (appointment.status === "COMPLETED") {
    throw AppError.badRequest("Completed appointments cannot be cancelled.");
  }

  const dateStr = appointment.date.toISOString().slice(0, 10);
  const today = todayCalendarDate();
  const isPast = dateStr < today || (dateStr === today && timeToMinutes(appointment.startTime) < nowMinutesOfDay());
  if (isPast) {
    throw AppError.badRequest("Past appointments cannot be cancelled.");
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED", cancelledAt: new Date(), cancellationReason: reason || null },
    include: appointmentInclude,
  });

  return toPublicAppointment(updated);
}
