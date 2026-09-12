# API Reference

Base URL (local development): `http://localhost:4000/api`

All responses share a consistent envelope.

**Success:**

```json
{ "success": true, "data": { }, "meta": { "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 } } }
```

**Error:**

```json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "Invalid request body.", "details": [] } }
```

`error.code` is a stable machine-readable string (`BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`,
`CONFLICT`, `UNPROCESSABLE_ENTITY`, `TOO_MANY_REQUESTS`, `INTERNAL_ERROR`); `details` is present only for
validation errors and lists the offending Zod issues.

## Authentication

The API uses a short-lived JWT **access token** (returned in the response body, sent by the client as
`Authorization: Bearer <token>`) plus a long-lived **refresh token** stored server-side (hashed) and handed to
the browser as an `httpOnly` cookie scoped to `/api/auth`. This means the access token can safely live in memory
on the client and is never persisted to `localStorage`.

| Method | Path                | Auth required | Description |
|--------|---------------------|:---:|--------------|
| POST   | `/auth/register`    | No  | Create a patient account. Body: `fullName`, `email`, `password`, `phone?`. Sets the refresh cookie and returns `{ user, accessToken }`. |
| POST   | `/auth/login`       | No  | Body: `email`, `password`. Same response shape as register. |
| POST   | `/auth/refresh`     | Cookie | Rotates the refresh token and issues a new access token. |
| POST   | `/auth/logout`      | Cookie | Revokes the current refresh token and clears the cookie. |
| GET    | `/auth/me`          | Yes | Returns the current user's profile. |
| PATCH  | `/auth/me`          | Yes | Updates `fullName?`, `phone?`, `dateOfBirth?`. |

Auth endpoints are rate-limited to 20 requests / 15 minutes per IP to slow down credential stuffing.

## Specialties

| Method | Path            | Auth | Description |
|--------|-----------------|:---:|--------------|
| GET    | `/specialties`  | No  | List all specialties with a live `doctorCount` per specialty. |

## Doctors

| Method | Path                          | Auth | Description |
|--------|-------------------------------|:---:|--------------|
| GET    | `/doctors`                    | No  | List active doctors. Query: `search?`, `specialtySlug?`, `sortBy?` (`rating` \| `experience` \| `feeAsc` \| `feeDesc`), `page?`, `limit?` (max 50). |
| GET    | `/doctors/:id`                | No  | Full profile: bio, clinic address, slot duration, weekly schedule. |
| GET    | `/doctors/:id/availability`   | No  | Query: `date` (`YYYY-MM-DD`, today..+60 days). Returns `{ isDayOff, slots: [{ startTime, endTime, available }] }` for that calendar date, with already-booked and past-cutoff slots marked unavailable. |

## Appointments

All appointment routes require `Authorization: Bearer <accessToken>` and only ever operate on **the calling
patient's own appointments** — there is no way to read or cancel another patient's booking through the API.

| Method | Path                       | Description |
|--------|----------------------------|--------------|
| POST   | `/appointments`            | Create a booking. Body: `doctorId`, `date`, `startTime`, `reasonForVisit`, `notes?`, `patientFullName`, `patientEmail`, `patientPhone`. Rejects past dates, slots outside the doctor's schedule, the doctor's declared days off, and slots already booked (`409 CONFLICT`) — see "Double-booking prevention" below. |
| GET    | `/appointments`            | List the current user's appointments. Query: `filter?` (`upcoming` \| `past` \| `cancelled` \| `all`, default `all`), `page?`, `limit?`. |
| GET    | `/appointments/:id`        | Fetch one appointment by id (404 if it doesn't belong to the caller). |
| PATCH  | `/appointments/:id/cancel` | Cancel an upcoming appointment. Body: `reason?`. Rejects already-cancelled, completed, or past appointments (`400`). |

### Double-booking prevention

Booking conflicts are prevented at two layers:

1. **Application layer** — before inserting a row, the service recomputes the doctor's available slots for
   that date (weekly template minus existing bookings minus declared time off) and rejects the request with a
   friendly `409 CONFLICT` if the slot isn't actually open.
2. **Database layer** — a partial unique index on `Appointment(doctorId, date, startTime)` **where `status <>
   'CANCELLED'`** makes it physically impossible for two non-cancelled appointments to occupy the same
   doctor/date/time, even under concurrent requests racing past the application check. Because cancelled rows
   are excluded from the index, the exact same slot can be booked again by someone else after a cancellation.

The same pattern additionally blocks a single patient from holding two appointments (with any doctors) at the
identical date and time.

## Health check

`GET /api/health` — unauthenticated liveness probe, returns `{ status: "ok", timestamp }`.
