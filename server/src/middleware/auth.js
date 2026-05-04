import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  memberId: user.member?.id ?? null,
  coachId: user.coach?.id ?? null,
  name: user.member
    ? `${user.member.firstName} ${user.member.lastName}`
    : user.coach
      ? `${user.coach.firstName} ${user.coach.lastName}`
      : "Administrateur"
});

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authentification requise." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { member: true, coach: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Session invalide." });
    }

    req.user = publicUser(user);
    next();
  } catch {
    res.status(401).json({ message: "Session expiree ou invalide." });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Acces non autorise." });
  }
  next();
};

export { publicUser };
