import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, publicUser } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const resetTokens = new Map();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8)
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: z.string().min(8)
});

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
      include: { member: true, coach: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    const isValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({ token, user: publicUser(user) });
  })
);

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const payload = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() }
    });

    let resetToken;

    if (user?.isActive) {
      resetToken = crypto.randomBytes(32).toString("hex");
      resetTokens.set(resetToken, {
        userId: user.id,
        expiresAt: Date.now() + 15 * 60 * 1000
      });
      console.log(`Demande de reinitialisation du mot de passe pour ${user.email}`);
    }

    res.json({
      message: "Si ce compte existe, une demande de reinitialisation a ete enregistree.",
      resetToken: process.env.NODE_ENV === "production" ? undefined : resetToken
    });
  })
);

router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const payload = resetPasswordSchema.parse(req.body);
    const reset = resetTokens.get(payload.token);

    if (!reset || reset.expiresAt < Date.now()) {
      resetTokens.delete(payload.token);
      return res.status(400).json({ message: "Lien de reinitialisation invalide ou expire." });
    }

    const passwordHash = await bcrypt.hash(payload.newPassword, 10);
    await prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash }
    });
    resetTokens.delete(payload.token);

    res.json({
      message: "Mot de passe reinitialise. Vous pouvez vous connecter avec le nouveau mot de passe."
    });
  })
);

router.put(
  "/change-password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const isValid = await bcrypt.compare(payload.currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect." });
    }

    const passwordHash = await bcrypt.hash(payload.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    res.json({ message: "Mot de passe mis a jour." });
  })
);

export default router;
