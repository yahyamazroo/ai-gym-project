import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import coachRoutes from "./routes/coachRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import portalRoutes from "./routes/portalRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "GETFIT GYM" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/coaches", coachRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/portal", portalRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route introuvable: ${req.method} ${req.path}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.name === "ZodError") {
    return res.status(400).json({
      message: "Donnees invalides.",
      details: error.issues
    });
  }

  if (error.code === "P2002") {
    return res.status(409).json({
      message: "Une valeur unique existe deja.",
      details: error.meta
    });
  }

  const status = error.statusCode || 500;
  res.status(status).json({
    message: status === 500 ? "Erreur interne du serveur." : error.message,
    details: process.env.NODE_ENV === "production" ? undefined : error.details
  });
});

app.listen(port, () => {
  console.log(`API GETFIT GYM disponible sur http://localhost:${port}/api`);
});
