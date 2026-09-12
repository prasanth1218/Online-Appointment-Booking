/**
 * A known, operational error we intentionally raised (bad input, missing
 * resource, conflicting state, etc.). The central error handler trusts its
 * `message` and `statusCode` to be safe to send to the client; anything that
 * is NOT an AppError is treated as a bug and hidden behind a generic message.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Authentication is required.") {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have permission to perform this action.") {
    return new AppError(403, "FORBIDDEN", message);
  }

  static notFound(message = "The requested resource was not found.") {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(message: string, details?: unknown) {
    return new AppError(409, "CONFLICT", message, details);
  }

  static unprocessable(message: string, details?: unknown) {
    return new AppError(422, "UNPROCESSABLE_ENTITY", message, details);
  }

  static tooManyRequests(message = "Too many requests. Please try again later.") {
    return new AppError(429, "TOO_MANY_REQUESTS", message);
  }

  static internal(message = "Something went wrong. Please try again.") {
    return new AppError(500, "INTERNAL_ERROR", message);
  }
}
