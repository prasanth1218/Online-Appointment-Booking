import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { availabilityQuerySchema, doctorIdParamSchema, listDoctorsQuerySchema } from "./doctors.schemas.js";
import * as doctorsController from "./doctors.controller.js";

export const doctorsRouter = Router();

doctorsRouter.get("/", validate({ query: listDoctorsQuerySchema }), doctorsController.listDoctors);
doctorsRouter.get("/:id", validate({ params: doctorIdParamSchema }), doctorsController.getDoctorById);
doctorsRouter.get(
  "/:id/availability",
  validate({ params: doctorIdParamSchema, query: availabilityQuerySchema }),
  doctorsController.getDoctorAvailability,
);
