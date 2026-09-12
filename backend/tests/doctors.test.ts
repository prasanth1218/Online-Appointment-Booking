import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, createTestDoctor, createTestSpecialty, daysFromToday, resetDatabase } from "./helpers.js";
import { prisma } from "../src/lib/prisma.js";

describe("Doctors & availability", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("lists active doctors with pagination", async () => {
    const specialty = await createTestSpecialty();
    await createTestDoctor(specialty.id, { fullName: "Dr. One" });
    await createTestDoctor(specialty.id, { fullName: "Dr. Two" });

    const res = await request(app).get("/api/doctors");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.pagination.total).toBe(2);
  });

  it("filters doctors by specialty slug and search term", async () => {
    const cardiology = await createTestSpecialty({ name: "Cardiology", slug: "cardiology" });
    const dermatology = await createTestSpecialty({ name: "Dermatology", slug: "dermatology" });
    await createTestDoctor(cardiology.id, { fullName: "Dr. Heart" });
    await createTestDoctor(dermatology.id, { fullName: "Dr. Skin" });

    const bySpecialty = await request(app).get("/api/doctors?specialtySlug=cardiology");
    expect(bySpecialty.body.data).toHaveLength(1);
    expect(bySpecialty.body.data[0].fullName).toBe("Dr. Heart");

    const bySearch = await request(app).get("/api/doctors?search=Skin");
    expect(bySearch.body.data).toHaveLength(1);
    expect(bySearch.body.data[0].fullName).toBe("Dr. Skin");
  });

  it("returns 404 for an unknown doctor id", async () => {
    const res = await request(app).get("/api/doctors/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });

  it("rejects a malformed doctor id", async () => {
    const res = await request(app).get("/api/doctors/not-a-uuid");
    expect(res.status).toBe(400);
  });

  it("computes available slots for a future date and marks a booked slot unavailable", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const date = daysFromToday(7);

    const before = await request(app).get(`/api/doctors/${doctor.id}/availability?date=${date}`);
    expect(before.status).toBe(200);
    expect(before.body.data.slots.length).toBeGreaterThan(0);
    expect(before.body.data.slots.every((s: { available: boolean }) => s.available)).toBe(true);

    await prisma.appointment.create({
      data: {
        patientId: (await prisma.user.create({
          data: { email: "occupant@example.com", passwordHash: "x", fullName: "Occupant" },
        })).id,
        doctorId: doctor.id,
        date: new Date(`${date}T00:00:00Z`),
        startTime: "10:00",
        endTime: "10:30",
        reasonForVisit: "Checkup",
        patientFullName: "Occupant",
        patientEmail: "occupant@example.com",
        patientPhone: "+15551230000",
      },
    });

    const after = await request(app).get(`/api/doctors/${doctor.id}/availability?date=${date}`);
    const bookedSlot = after.body.data.slots.find((s: { startTime: string }) => s.startTime === "10:00");
    expect(bookedSlot.available).toBe(false);
  });

  it("rejects an availability request for a past date", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const pastDate = daysFromToday(-1);

    const res = await request(app).get(`/api/doctors/${doctor.id}/availability?date=${pastDate}`);
    expect(res.status).toBe(400);
  });

  it("returns no slots on a doctor's declared day off", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const date = daysFromToday(10);

    await prisma.doctorTimeOff.create({ data: { doctorId: doctor.id, date: new Date(`${date}T00:00:00Z`), reason: "Leave" } });

    const res = await request(app).get(`/api/doctors/${doctor.id}/availability?date=${date}`);
    expect(res.body.data.isDayOff).toBe(true);
    expect(res.body.data.slots).toHaveLength(0);
  });
});
