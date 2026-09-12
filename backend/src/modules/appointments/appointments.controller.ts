import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as appointmentsService from "./appointments.service.js";
import type { ListAppointmentsQuery } from "./appointments.schemas.js";

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentsService.createAppointment(req.user!.id, req.body);
  sendSuccess(res, 201, appointment);
});

export const listAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { appointments, pagination } = await appointmentsService.listAppointments(
    req.user!.id,
    req.query as unknown as ListAppointmentsQuery,
  );
  sendSuccess(res, 200, appointments, { pagination });
});

export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentsService.getAppointmentById(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, appointment);
});

export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentsService.cancelAppointment(
    req.user!.id,
    req.params.id as string,
    (req.body as { reason?: string }).reason,
  );
  sendSuccess(res, 200, appointment);
});
