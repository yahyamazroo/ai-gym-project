import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toDate } from "../utils/dates.js";

const router = Router();

const courseSchema = z.object({
  title: z.string().min(2),
  activity: z.string().min(2),
  description: z.string().optional().nullable(),
  startsAt: z.string().min(4),
  endsAt: z.string().min(4),
  capacity: z.coerce.number().int().positive(),
  room: z.string().optional().nullable(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
  coachId: z.coerce.number().int().positive().optional().nullable()
});

const include = {
  coach: true,
  enrollments: { include: { member: true }, orderBy: { createdAt: "desc" } },
  attendance: true
};

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const where = req.user.role === "COACH" ? { coachId: req.user.coachId } : {};
    const courses = await prisma.course.findMany({
      where,
      include,
      orderBy: { startsAt: "asc" }
    });
    res.json(courses);
  })
);

router.post(
  "/",
  requireRole("ADMIN", "COACH"),
  asyncHandler(async (req, res) => {
    const payload = courseSchema.parse(req.body);
    const coachId = req.user.role === "COACH" ? req.user.coachId : payload.coachId;
    if (!coachId) return res.status(400).json({ message: "Coach obligatoire." });

    const course = await prisma.course.create({
      data: {
        title: payload.title,
        activity: payload.activity,
        description: payload.description,
        startsAt: toDate(payload.startsAt),
        endsAt: toDate(payload.endsAt),
        capacity: payload.capacity,
        room: payload.room,
        status: payload.status ?? "SCHEDULED",
        coachId
      },
      include
    });
    res.status(201).json(course);
  })
);

router.put(
  "/:id",
  requireRole("ADMIN", "COACH"),
  asyncHandler(async (req, res) => {
    const payload = courseSchema.partial().parse(req.body);
    const existing = await prisma.course.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ message: "Cours introuvable." });
    if (req.user.role === "COACH" && existing.coachId !== req.user.coachId) {
      return res.status(403).json({ message: "Cours hors planning du coach." });
    }

    const course = await prisma.course.update({
      where: { id: Number(req.params.id) },
      data: {
        title: payload.title,
        activity: payload.activity,
        description: payload.description,
        startsAt: payload.startsAt === undefined ? undefined : toDate(payload.startsAt),
        endsAt: payload.endsAt === undefined ? undefined : toDate(payload.endsAt),
        capacity: payload.capacity,
        room: payload.room,
        status: payload.status,
        coachId: req.user.role === "ADMIN" ? payload.coachId : undefined
      },
      include
    });
    res.json(course);
  })
);

router.post(
  "/:id/enroll",
  asyncHandler(async (req, res) => {
    const courseId = Number(req.params.id);
    const memberId = req.user.role === "MEMBER" ? req.user.memberId : Number(req.body.memberId);
    if (!memberId) return res.status(400).json({ message: "Membre obligatoire." });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { enrollments: true }
    });

    if (!course) return res.status(404).json({ message: "Cours introuvable." });
    if (course.enrollments.length >= course.capacity) {
      return res.status(409).json({ message: "Capacite maximale atteinte." });
    }

    await prisma.enrollment.create({ data: { memberId, courseId } });
    const updated = await prisma.course.findUnique({ where: { id: courseId }, include });
    res.status(201).json(updated);
  })
);

router.delete(
  "/:id/enrollments/:memberId",
  asyncHandler(async (req, res) => {
    const courseId = Number(req.params.id);
    const memberId = Number(req.params.memberId);

    if (req.user.role === "MEMBER" && req.user.memberId !== memberId) {
      return res.status(403).json({ message: "Acces non autorise." });
    }

    await prisma.enrollment.delete({
      where: { memberId_courseId: { memberId, courseId } }
    });
    res.status(204).end();
  })
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.course.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  })
);

export default router;
