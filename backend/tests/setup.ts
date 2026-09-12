import "dotenv/config";

if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL must be set (see .env.example) to run the test suite.");
}

// Redirect every module that reads DATABASE_URL (env.ts, PrismaClient) to the
// disposable test database, and ensure request logging / dev-only behavior
// stays off during tests.
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-please-change-0123456789abcdef";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-please-change-0123456789abcdef";
