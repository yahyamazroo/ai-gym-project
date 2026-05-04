import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toDate } from "../utils/dates.js";

const router = Router();

const paymentSchema = z.object({
  memberId: z.coerce.number().int().positive(),
  subscriptionId: z.coerce.number().int().positive().optional().nullable(),
  amount: z.coerce.number().positive(),
  method: z.string().min(2),
  status: z.enum(["PAID", "PENDING", "FAILED"]).default("PAID"),
  paidAt: z.string().optional().nullable(),
  reference: z.string().optional().nullable()
});

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const where = req.user.role === "MEMBER" ? { memberId: req.user.memberId } : {};
    const payments = await prisma.payment.findMany({
      where,
      include: { member: true, subscription: { include: { plan: true } } },
      orderBy: { paidAt: "desc" }
    });
    res.json(payments);
  })
);

router.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = paymentSchema.parse(req.body);
    const payment = await prisma.payment.create({
      data: {
        memberId: payload.memberId,
        subscriptionId: payload.subscriptionId,
        amount: payload.amount,
        method: payload.method,
        status: payload.status,
        paidAt: toDate(payload.paidAt) ?? new Date(),
        reference: payload.reference
      },
      include: { member: true, subscription: { include: { plan: true } } }
    });
    res.status(201).json(payment);
  })
);

router.put(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = paymentSchema.partial().parse(req.body);
    const payment = await prisma.payment.update({
      where: { id: Number(req.params.id) },
      data: {
        memberId: payload.memberId,
        subscriptionId: payload.subscriptionId,
        amount: payload.amount,
        method: payload.method,
        status: payload.status,
        paidAt: payload.paidAt === undefined ? undefined : toDate(payload.paidAt),
        reference: payload.reference
      },
      include: { member: true, subscription: { include: { plan: true } } }
    });
    res.json(payment);
  })
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.payment.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  })
);

export default router;
