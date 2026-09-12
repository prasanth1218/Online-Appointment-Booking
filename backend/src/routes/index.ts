import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { doctorsRouter } from "../modules/doctors/doctors.routes.js";
import { specialtiesRouter } from "../modules/specialties/specialties.routes.js";
import { appointmentsRouter } from "../modules/appointments/appointments.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/doctors", doctorsRouter);
apiRouter.use("/specialties", specialtiesRouter);
apiRouter.use("/appointments", appointmentsRouter);
