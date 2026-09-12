import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, resetDatabase } from "./helpers.js";
import { prisma } from "../src/lib/prisma.js";

describe("Auth", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers a new patient and returns an access token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Passw0rd!",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("ada@example.com");
    expect(res.body.data.accessToken).toBeTypeOf("string");
    expect(res.headers["set-cookie"]?.[0]).toContain("refreshToken=");
  });

  it("rejects registration with a weak password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "short",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_REQUEST");
  });

  it("rejects registration with a duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Passw0rd!",
    });

    const res = await request(app).post("/api/auth/register").send({
      fullName: "Ada Second",
      email: "ada@example.com",
      password: "Passw0rd!",
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("logs in with correct credentials and rejects incorrect ones", async () => {
    await request(app).post("/api/auth/register").send({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Passw0rd!",
    });

    const good = await request(app).post("/api/auth/login").send({ email: "ada@example.com", password: "Passw0rd!" });
    expect(good.status).toBe(200);
    expect(good.body.data.accessToken).toBeTypeOf("string");

    const bad = await request(app).post("/api/auth/login").send({ email: "ada@example.com", password: "WrongPass1" });
    expect(bad.status).toBe(401);
  });

  it("rejects /me without a token and accepts it with one", async () => {
    const unauth = await request(app).get("/api/auth/me");
    expect(unauth.status).toBe(401);

    const register = await request(app).post("/api/auth/register").send({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Passw0rd!",
    });
    const token = register.body.data.accessToken as string;

    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe("ada@example.com");
  });

  it("updates the current user's profile", async () => {
    const register = await request(app).post("/api/auth/register").send({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Passw0rd!",
    });
    const token = register.body.data.accessToken as string;

    const res = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Ada L. Byron", phone: "+1 555-1234" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.fullName).toBe("Ada L. Byron");
    expect(res.body.data.user.phone).toBe("+1 555-1234");
  });

  it("rotates the refresh token and issues a new access token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Passw0rd!",
    });
    const cookie = registerRes.headers["set-cookie"];

    const refreshRes = await request(app).post("/api/auth/refresh").set("Cookie", cookie);
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeTypeOf("string");
  });

  it("logs out and invalidates the refresh token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Passw0rd!",
    });
    const cookie = registerRes.headers["set-cookie"];

    const logoutRes = await request(app).post("/api/auth/logout").set("Cookie", cookie);
    expect(logoutRes.status).toBe(200);

    const refreshRes = await request(app).post("/api/auth/refresh").set("Cookie", cookie);
    expect(refreshRes.status).toBe(401);
  });
});
