import type { Response } from "express";

/**
 * Consistent success envelope used by every endpoint:
 * { success: true, data, meta? }
 */
export function sendSuccess<T>(res: Response, statusCode: number, data: T, meta?: Record<string, unknown>) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}
