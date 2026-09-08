import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  applyToOpportunity,
  listMyApplications,
  listApplicationsForOpportunity,
  updateApplicationStatus,
  toggleStar,
  addFeedback,
} from "../controllers/application.controller.js";

const router = Router();

router.get("/mine", authenticate, requireRole("student"), listMyApplications);
router.post("/:opportunityId/apply", authenticate, requireRole("student"), applyToOpportunity);
router.get(
  "/opportunity/:opportunityId",
  authenticate,
  requireRole("industry", "recruiter"),
  listApplicationsForOpportunity
);
router.patch("/:id/status", authenticate, requireRole("industry", "recruiter"), updateApplicationStatus);
router.patch("/:id/star", authenticate, requireRole("industry", "recruiter"), toggleStar);
router.post("/:id/feedback", authenticate, requireRole("industry", "recruiter"), addFeedback);

export default router;
