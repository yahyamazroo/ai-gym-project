import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateTrainingRecommendation } from "../services/recommendationService.js";

const router = Router();

const memberInclude = {
  attendance: true,
  payments: true,
  subscriptions: { include: { plan: true }, orderBy: { endDate: "desc" } },
  enrollments: { include: { course: true } },
  recommendations: { orderBy: { generatedAt: "desc" } }
};

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const where = req.user.role === "MEMBER" ? { memberId: req.user.memberId } : {};
    const recommendations = await prisma.recommendation.findMany({
      where,
      include: { member: true },
      orderBy: { generatedAt: "desc" }
    });
    res.json(recommendations);
  })
);

router.post(
  "/generate/:memberId",
  asyncHandler(async (req, res) => {
    const memberId = Number(req.params.memberId);
    if (req.user.role === "MEMBER" && req.user.memberId !== memberId) {
      return res.status(403).json({ message: "Acces non autorise." });
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: memberInclude
    });

    if (!member) return res.status(404).json({ message: "Membre introuvable." });

    const recommendation = generateTrainingRecommendation(member);
    const created = await prisma.recommendation.create({
      data: {
        memberId,
        goal: recommendation.goal,
        summary: recommendation.summary,
        weeklyFrequency: recommendation.weeklyFrequency,
        intensity: recommendation.intensity,
        plan: JSON.stringify(recommendation.plan)
      },
      include: { member: true }
    });

    res.status(201).json(created);
  })
);

export default router;
