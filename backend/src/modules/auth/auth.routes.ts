import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { authRateLimiter } from "../../middleware/rateLimit.js";
import { loginSchema, registerSchema, updateProfileSchema } from "./auth.schemas.js";
import * as authController from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, validate({ body: registerSchema }), authController.register);
authRouter.post("/login", authRateLimiter, validate({ body: loginSchema }), authController.login);
authRouter.post("/refresh", authRateLimiter, authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", requireAuth, authController.getMe);
authRouter.patch("/me", requireAuth, validate({ body: updateProfileSchema }), authController.updateMe);
