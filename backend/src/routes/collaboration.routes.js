import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  createActivity,
  listOpenActivities,
  listMyActivities,
  applyToActivity,
  respondToApplicant,
  closeActivity,
} from "../controllers/collaboration.controller.js";

const router = Router();

const POSTER_ROLES = ["academician", "industry", "recruiter"];

router.get("/", authenticate, listOpenActivities);
router.get("/mine", authenticate, requireRole(...POSTER_ROLES), listMyActivities);
router.post("/", authenticate, requireRole(...POSTER_ROLES), createActivity);
router.post("/:id/apply", authenticate, applyToActivity);
router.patch("/:id/applicants/:applicantId", authenticate, requireRole(...POSTER_ROLES), respondToApplicant);
router.patch("/:id/close", authenticate, requireRole(...POSTER_ROLES), closeActivity);

export default router;
