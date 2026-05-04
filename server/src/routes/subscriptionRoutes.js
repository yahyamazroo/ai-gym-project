import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addDays, toDate } from "../utils/dates.js";

const router = Router();

const subscriptionSchema = z.object({
  memberId: z.coerce.number().int().positive(),
  planId: z.coerce.number().int().positive(),
  startDate: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "EXPIRED", "SUSPENDED"]).optional(),
  createPayment: z.boolean().optional(),
  method: z.string().optional().nullable(),
  reference: z.string().optional().nullable()
});

router.use(requireAuth);

router.get(
  "/",
  requireRole("ADMIN", "COACH"),
  asyncHandler(async (_req, res) => {
    const subscriptions = await prisma.subscription.findMany({
      include: { member: true, plan: true, payments: true },
      orderBy: { endDate: "desc" }
    });
    res.json(subscriptions);
  })
);

router.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = subscriptionSchema.parse(req.body);
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: payload.planId } });
    if (!plan) return res.status(404).json({ message: "Plan introuvable." });

    const startDate = toDate(payload.startDate) ?? new Date();
    const endDate = addDays(startDate, plan.durationDays);

    const subscription = await prisma.$transaction(async (tx) => {
      const created = await tx.subscription.create({
        data: {
          memberId: payload.memberId,
          planId: payload.planId,
          startDate,
          endDate,
          status: payload.status ?? "ACTIVE"
        },
        include: { member: true, plan: true, payments: true }
      });

      if (payload.createPayment) {
        await tx.payment.create({
          data: {
            memberId: payload.memberId,
            subscriptionId: created.id,
            amount: plan.price,
            method: payload.method || "Especes",
            status: "PAID",
            reference: payload.reference || `SUB-${created.id}`
          }
        });
      }

      return tx.subscription.findUnique({
        where: { id: created.id },
        include: { member: true, plan: true, payments: true }
      });
    });

    res.status(201).json(subscription);
  })
);

router.put(
  "/:id/status",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = z.object({ status: z.enum(["ACTIVE", "EXPIRED", "SUSPENDED"]) }).parse(req.body);
    const subscription = await prisma.subscription.update({
      where: { id: Number(req.params.id) },
      data: { status: payload.status },
      include: { member: true, plan: true, payments: true }
    });
    res.json(subscription);
  })
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.subscription.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  })
);

export default router;
