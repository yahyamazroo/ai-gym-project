import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toDate } from "../utils/dates.js";

const router = Router();

const memberSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  objective: z.string().min(2),
  level: z.string().min(2),
  weightKg: z.coerce.number().optional().nullable(),
  heightCm: z.coerce.number().int().optional().nullable(),
  progressScore: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional().nullable(),
  password: z.string().min(6).optional().nullable()
});

const memberInclude = {
  subscriptions: { include: { plan: true }, orderBy: { endDate: "desc" } },
  payments: { orderBy: { paidAt: "desc" }, take: 5 },
  enrollments: { include: { course: true } },
  attendance: true,
  recommendations: { orderBy: { generatedAt: "desc" }, take: 1 }
};

router.use(requireAuth);

router.get(
  "/",
  requireRole("ADMIN", "COACH"),
  asyncHandler(async (_req, res) => {
    const members = await prisma.member.findMany({
      include: memberInclude,
      orderBy: { createdAt: "desc" }
    });
    res.json(members);
  })
);

router.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = memberSchema.parse(req.body);
    const member = await prisma.$transaction(async (tx) => {
      let userId = null;
      if (payload.password) {
        const passwordHash = await bcrypt.hash(payload.password, 10);
        const user = await tx.user.create({
          data: {
            email: payload.email.toLowerCase(),
            passwordHash,
            role: "MEMBER"
          }
        });
        userId = user.id;
      }

      return tx.member.create({
        data: {
          userId,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email.toLowerCase(),
          phone: payload.phone,
          gender: payload.gender,
          birthDate: toDate(payload.birthDate),
          objective: payload.objective,
          level: payload.level,
          weightKg: payload.weightKg,
          heightCm: payload.heightCm,
          progressScore: payload.progressScore ?? 0,
          notes: payload.notes
        },
        include: memberInclude
      });
    });

    res.status(201).json(member);
  })
);

router.get(
  "/:id",
  requireRole("ADMIN", "COACH"),
  asyncHandler(async (req, res) => {
    const member = await prisma.member.findUnique({
      where: { id: Number(req.params.id) },
      include: memberInclude
    });

    if (!member) return res.status(404).json({ message: "Membre introuvable." });
    res.json(member);
  })
);

router.put(
  "/:id",
  requireRole("ADMIN", "COACH"),
  asyncHandler(async (req, res) => {
    const payload = memberSchema.partial().parse(req.body);
    const member = await prisma.member.update({
      where: { id: Number(req.params.id) },
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email?.toLowerCase(),
        phone: payload.phone,
        gender: payload.gender,
        birthDate: payload.birthDate === undefined ? undefined : toDate(payload.birthDate),
        objective: payload.objective,
        level: payload.level,
        weightKg: payload.weightKg,
        heightCm: payload.heightCm,
        progressScore: payload.progressScore,
        notes: payload.notes
      },
      include: memberInclude
    });
    res.json(member);
  })
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.member.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  })
);

export default router;
