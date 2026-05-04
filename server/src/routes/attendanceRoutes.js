import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toDate } from "../utils/dates.js";

const router = Router();

const attendanceSchema = z.object({
  memberId: z.coerce.number().int().positive(),
  courseId: z.coerce.number().int().positive().optional().nullable(),
  checkInAt: z.string().optional().nullable(),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]).default("PRESENT"),
  notes: z.string().optional().nullable()
});

router.use(requireAuth);

router.get(
  "/",
  requireRole("ADMIN", "COACH"),
  asyncHandler(async (req, res) => {
    const where = req.user.role === "COACH" ? { course: { coachId: req.user.coachId } } : {};
    const attendance = await prisma.attendance.findMany({
      where,
      include: { member: true, course: { include: { coach: true } } },
      orderBy: { checkInAt: "desc" }
    });
    res.json(attendance);
  })
);

router.post(
  "/",
  requireRole("ADMIN", "COACH"),
  asyncHandler(async (req, res) => {
    const payload = attendanceSchema.parse(req.body);
    if (req.user.role === "COACH" && payload.courseId) {
      const course = await prisma.course.findUnique({ where: { id: payload.courseId } });
      if (!course || course.coachId !== req.user.coachId) {
        return res.status(403).json({ message: "Cours hors planning du coach." });
      }
    }

    const attendance = await prisma.attendance.create({
      data: {
        memberId: payload.memberId,
        courseId: payload.courseId,
        checkInAt: toDate(payload.checkInAt) ?? new Date(),
        status: payload.status,
        notes: payload.notes
      },
      include: { member: true, course: { include: { coach: true } } }
    });
    res.status(201).json(attendance);
  })
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.attendance.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  })
);

export default router;
