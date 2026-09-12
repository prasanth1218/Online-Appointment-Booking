import { execSync } from "node:child_process";
import "dotenv/config";

/**
 * Runs once before the whole test suite: applies all pending migrations to
 * the dedicated test database so tests always run against an up-to-date,
 * disposable schema (never against the development database).
 */
export default function globalSetup() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL must be set (see .env.example) to run the test suite.");
  }

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
  });
}
