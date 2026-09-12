import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  appointmentIdParamSchema,
  cancelAppointmentSchema,
  createAppointmentSchema,
  listAppointmentsQuerySchema,
} from "./appointments.schemas.js";
import * as appointmentsController from "./appointments.controller.js";

export const appointmentsRouter = Router();

appointmentsRouter.use(requireAuth);

appointmentsRouter.post("/", validate({ body: createAppointmentSchema }), appointmentsController.createAppointment);
appointmentsRouter.get("/", validate({ query: listAppointmentsQuerySchema }), appointmentsController.listAppointments);
appointmentsRouter.get("/:id", validate({ params: appointmentIdParamSchema }), appointmentsController.getAppointmentById);
appointmentsRouter.patch(
  "/:id/cancel",
  validate({ params: appointmentIdParamSchema, body: cancelAppointmentSchema }),
  appointmentsController.cancelAppointment,
);
