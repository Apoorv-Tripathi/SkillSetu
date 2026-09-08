import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import assessmentRoutes from "./routes/assessment.routes.js";
import studentRoutes from "./routes/student.routes.js";
import opportunityRoutes from "./routes/opportunity.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import milestoneRoutes from "./routes/milestone.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import mentorshipRoutes from "./routes/mentorship.routes.js";
import institutionRoutes from "./routes/institution.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import collaborationRoutes from "./routes/collaboration.routes.js";
import academicianRoutes from "./routes/academician.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/collaboration", collaborationRoutes);
app.use("/api/academician", academicianRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);
