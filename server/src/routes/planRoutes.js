import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const planSchema = z.object({
  name: z.string().min(2),
  durationDays: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  benefits: z.string().optional().nullable()
});

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const plans = await prisma.subscriptionPlan.findMany({
      include: { _count: { select: { subscriptions: true } } },
      orderBy: { price: "asc" }
    });
    res.json(plans);
  })
);

router.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = planSchema.parse(req.body);
    const plan = await prisma.subscriptionPlan.create({ data: payload });
    res.status(201).json(plan);
  })
);

router.put(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = planSchema.partial().parse(req.body);
    const plan = await prisma.subscriptionPlan.update({
      where: { id: Number(req.params.id) },
      data: payload
    });
    res.json(plan);
  })
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.subscriptionPlan.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  })
);

export default router;
