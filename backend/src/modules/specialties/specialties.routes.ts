import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";

export const specialtiesRouter = Router();

specialtiesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const specialties = await prisma.specialty.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { doctors: { where: { isActive: true } } } } },
    });

    sendSuccess(
      res,
      200,
      specialties.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        icon: s.icon,
        doctorCount: s._count.doctors,
      })),
    );
  }),
);
