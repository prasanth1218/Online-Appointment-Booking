import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import {
  app,
  createTestDoctor,
  createTestSpecialty,
  daysFromToday,
  registerAndLogin,
  resetDatabase,
} from "./helpers.js";
import { prisma } from "../src/lib/prisma.js";

function bookingPayload(overrides: Record<string, unknown> = {}) {
  return {
    reasonForVisit: "Annual checkup",
    patientFullName: "Patient Tester",
    patientEmail: "patient.1@example.com",
    patientPhone: "+1 555-0100",
    ...overrides,
  };
}

describe("Appointments", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("requires authentication to create an appointment", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const res = await request(app)
      .post("/api/appointments")
      .send(bookingPayload({ doctorId: doctor.id, date: daysFromToday(3), startTime: "09:00" }));
    expect(res.status).toBe(401);
  });

  it("books a valid appointment successfully", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const { accessToken } = await registerAndLogin();
    const date = daysFromToday(3);

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(bookingPayload({ doctorId: doctor.id, date, startTime: "09:00" }));

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("CONFIRMED");
    expect(res.body.data.displayStatus).toBe("upcoming");
    expect(res.body.data.date).toBe(date);
    expect(res.body.data.startTime).toBe("09:00");
  });

  it("rejects invalid appointment data", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const { accessToken } = await registerAndLogin();

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ doctorId: doctor.id, date: "not-a-date", startTime: "9am", reasonForVisit: "x" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_REQUEST");
  });

  it("rejects booking a slot that is not part of the doctor's schedule", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const { accessToken } = await registerAndLogin();
    const date = daysFromToday(3);

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(bookingPayload({ doctorId: doctor.id, date, startTime: "23:45" }));

    expect(res.status).toBe(400);
  });

  it("rejects booking a date in the past", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const { accessToken } = await registerAndLogin();

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(bookingPayload({ doctorId: doctor.id, date: daysFromToday(-2), startTime: "09:00" }));

    expect(res.status).toBe(400);
  });

  it("prevents double-booking the same doctor/date/time", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const { accessToken: tokenA } = await registerAndLogin("a");
    const { accessToken: tokenB } = await registerAndLogin("b");
    const date = daysFromToday(3);

    const first = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(bookingPayload({ doctorId: doctor.id, date, startTime: "09:30", patientEmail: "patient.a@example.com" }));
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${tokenB}`)
      .send(bookingPayload({ doctorId: doctor.id, date, startTime: "09:30", patientEmail: "patient.b@example.com" }));
    expect(second.status).toBe(409);
  });

  it("prevents the same patient from double-booking the same date/time across doctors", async () => {
    const specialty = await createTestSpecialty();
    const doctorOne = await createTestDoctor(specialty.id, { fullName: "Dr. One" });
    const doctorTwo = await createTestDoctor(specialty.id, { fullName: "Dr. Two" });
    const { accessToken } = await registerAndLogin();
    const date = daysFromToday(3);

    const first = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(bookingPayload({ doctorId: doctorOne.id, date, startTime: "09:30" }));
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(bookingPayload({ doctorId: doctorTwo.id, date, startTime: "09:30" }));
    expect(second.status).toBe(409);
  });

  it("allows re-booking a slot after the original appointment is cancelled", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const { accessToken: tokenA } = await registerAndLogin("a");
    const { accessToken: tokenB } = await registerAndLogin("b");
    const date = daysFromToday(3);

    const first = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(bookingPayload({ doctorId: doctor.id, date, startTime: "11:00", patientEmail: "patient.a@example.com" }));
    expect(first.status).toBe(201);

    const cancel = await request(app)
      .patch(`/api/appointments/${first.body.data.id}/cancel`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reason: "Change of plans" });
    expect(cancel.status).toBe(200);
    expect(cancel.body.data.status).toBe("CANCELLED");

    const second = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${tokenB}`)
      .send(bookingPayload({ doctorId: doctor.id, date, startTime: "11:00", patientEmail: "patient.b@example.com" }));
    expect(second.status).toBe(201);
  });

  it("does not allow cancelling someone else's appointment", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const { accessToken: tokenA } = await registerAndLogin("a");
    const { accessToken: tokenB } = await registerAndLogin("b");
    const date = daysFromToday(3);

    const created = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(bookingPayload({ doctorId: doctor.id, date, startTime: "13:00", patientEmail: "patient.a@example.com" }));

    const res = await request(app)
      .patch(`/api/appointments/${created.body.data.id}/cancel`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({});
    expect(res.status).toBe(404);
  });

  it("does not allow cancelling an already-cancelled appointment", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const { accessToken } = await registerAndLogin();
    const date = daysFromToday(3);

    const created = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(bookingPayload({ doctorId: doctor.id, date, startTime: "14:00" }));

    await request(app)
      .patch(`/api/appointments/${created.body.data.id}/cancel`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    const res = await request(app)
      .patch(`/api/appointments/${created.body.data.id}/cancel`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("lists only the current user's appointments, filtered by status", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const { accessToken: tokenA } = await registerAndLogin("a");
    const { accessToken: tokenB } = await registerAndLogin("b");
    const date = daysFromToday(3);

    await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(bookingPayload({ doctorId: doctor.id, date, startTime: "09:00", patientEmail: "patient.a@example.com" }));
    await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${tokenB}`)
      .send(bookingPayload({ doctorId: doctor.id, date, startTime: "09:30", patientEmail: "patient.b@example.com" }));

    const listA = await request(app).get("/api/appointments?filter=upcoming").set("Authorization", `Bearer ${tokenA}`);
    expect(listA.body.data).toHaveLength(1);
    expect(listA.body.data[0].patientEmail).toBe("patient.a@example.com");
  });

  it("returns 404 when fetching another patient's appointment by id", async () => {
    const specialty = await createTestSpecialty();
    const doctor = await createTestDoctor(specialty.id);
    const { accessToken: tokenA } = await registerAndLogin("a");
    const { accessToken: tokenB } = await registerAndLogin("b");
    const date = daysFromToday(3);

    const created = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(bookingPayload({ doctorId: doctor.id, date, startTime: "15:00", patientEmail: "patient.a@example.com" }));

    const res = await request(app)
      .get(`/api/appointments/${created.body.data.id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });
});
