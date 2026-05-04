import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const now = new Date();
    const inSevenDays = new Date(now);
    inSevenDays.setDate(now.getDate() + 7);

    if (req.user.role === "MEMBER") {
      const member = await prisma.member.findUnique({
        where: { id: req.user.memberId },
        include: {
          subscriptions: { include: { plan: true }, orderBy: { endDate: "desc" }, take: 1 },
          enrollments: { include: { course: { include: { coach: true } } }, orderBy: { createdAt: "desc" } },
          attendance: true,
          recommendations: { orderBy: { generatedAt: "desc" }, take: 1 }
        }
      });
      return res.json({ member });
    }

    const courseFilter = req.user.role === "COACH" ? { coachId: req.user.coachId } : {};
    const [
      members,
      coaches,
      activeSubscriptions,
      totalPayments,
      upcomingCourses,
      expiringSubscriptions,
      recentPayments,
      attendanceToday
    ] = await Promise.all([
      prisma.member.count(),
      prisma.coach.count(),
      prisma.subscription.count({ where: { status: "ACTIVE", endDate: { gte: now } } }),
      prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
      prisma.course.findMany({
        where: { ...courseFilter, startsAt: { gte: now }, status: "SCHEDULED" },
        include: { coach: true, enrollments: true },
        orderBy: { startsAt: "asc" },
        take: 5
      }),
      prisma.subscription.findMany({
        where: { status: "ACTIVE", endDate: { gte: now, lte: inSevenDays } },
        include: { member: true, plan: true },
        orderBy: { endDate: "asc" },
        take: 5
      }),
      prisma.payment.findMany({
        where: { status: "PAID" },
        include: { member: true },
        orderBy: { paidAt: "desc" },
        take: 5
      }),
      prisma.attendance.count({
        where: {
          checkInAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        }
      })
    ]);

    res.json({
      counts: {
        members,
        coaches,
        activeSubscriptions,
        revenue: totalPayments._sum.amount ?? 0,
        attendanceToday
      },
      upcomingCourses,
      expiringSubscriptions,
      recentPayments
    });
  })
);

export default router;
