import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const coachSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  specialty: z.string().min(2),
  bio: z.string().optional().nullable(),
  password: z.string().min(6).optional().nullable()
});

const include = {
  courses: { orderBy: { startsAt: "asc" }, take: 10 }
};

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const coaches = await prisma.coach.findMany({
      include,
      orderBy: { createdAt: "desc" }
    });
    res.json(coaches);
  })
);

router.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = coachSchema.parse(req.body);
    const coach = await prisma.$transaction(async (tx) => {
      let userId = null;
      if (payload.password) {
        const passwordHash = await bcrypt.hash(payload.password, 10);
        const user = await tx.user.create({
          data: {
            email: payload.email.toLowerCase(),
            passwordHash,
            role: "COACH"
          }
        });
        userId = user.id;
      }

      return tx.coach.create({
        data: {
          userId,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email.toLowerCase(),
          phone: payload.phone,
          specialty: payload.specialty,
          bio: payload.bio
        },
        include
      });
    });
    res.status(201).json(coach);
  })
);

router.put(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = coachSchema.partial().parse(req.body);
    const coach = await prisma.coach.update({
      where: { id: Number(req.params.id) },
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email?.toLowerCase(),
        phone: payload.phone,
        specialty: payload.specialty,
        bio: payload.bio
      },
      include
    });
    res.json(coach);
  })
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.coach.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  })
);

export default router;
