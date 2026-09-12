import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as doctorsService from "./doctors.service.js";
import type { ListDoctorsQuery } from "./doctors.schemas.js";

export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const { doctors, pagination } = await doctorsService.listDoctors(req.query as unknown as ListDoctorsQuery);
  sendSuccess(res, 200, doctors, { pagination });
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await doctorsService.getDoctorById(req.params.id as string);
  sendSuccess(res, 200, doctor);
});

export const getDoctorAvailability = asyncHandler(async (req: Request, res: Response) => {
  const availability = await doctorsService.getDoctorAvailability(
    req.params.id as string,
    (req.query as { date: string }).date,
  );
  sendSuccess(res, 200, availability);
});
