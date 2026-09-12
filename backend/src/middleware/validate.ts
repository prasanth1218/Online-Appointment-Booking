import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/**
 * Validates and replaces req.body / req.query / req.params with the parsed
 * (and coerced) values from the given Zod schemas. Fails fast with a 400 and
 * field-level error details when validation fails.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        next(AppError.badRequest("Invalid request body.", result.error.issues));
        return;
      }
      req.body = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        next(AppError.badRequest("Invalid query parameters.", result.error.issues));
        return;
      }
      // Express 5 exposes `req.query` as a getter-only property, so it
      // cannot be reassigned directly — redefine it instead.
      Object.defineProperty(req, "query", { value: result.data, configurable: true, enumerable: true, writable: true });
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        next(AppError.badRequest("Invalid route parameters.", result.error.issues));
        return;
      }
      Object.defineProperty(req, "params", { value: result.data, configurable: true, enumerable: true, writable: true });
    }

    next();
  };
}
