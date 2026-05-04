import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/member",
  requireRole("MEMBER"),
  asyncHandler(async (req, res) => {
    const member = await prisma.member.findUnique({
      where: { id: req.user.memberId },
      include: {
        subscriptions: { include: { plan: true }, orderBy: { endDate: "desc" } },
        payments: { orderBy: { paidAt: "desc" } },
        enrollments: { include: { course: { include: { coach: true } } }, orderBy: { createdAt: "desc" } },
        attendance: { include: { course: true }, orderBy: { checkInAt: "desc" } },
        recommendations: { orderBy: { generatedAt: "desc" } }
      }
    });
    res.json(member);
  })
);

router.get(
  "/coach",
  requireRole("COACH"),
  asyncHandler(async (req, res) => {
    const coach = await prisma.coach.findUnique({
      where: { id: req.user.coachId },
      include: {
        courses: {
          include: {
            enrollments: { include: { member: true } },
            attendance: { include: { member: true } }
          },
          orderBy: { startsAt: "asc" }
        }
      }
    });
    res.json(coach);
  })
);

export default router;
