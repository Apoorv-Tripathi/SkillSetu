import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  createMilestone,
  listMyMentorAssignments,
  listMilestonesForApplication,
  submitEvaluation,
} from "../controllers/milestone.controller.js";

const router = Router();

router.post("/", authenticate, requireRole("industry", "recruiter"), createMilestone);
router.get("/mine", authenticate, requireRole("mentor"), listMyMentorAssignments);
router.get("/application/:applicationId", authenticate, listMilestonesForApplication);
router.post("/:id/evaluate", authenticate, requireRole("mentor"), submitEvaluation);

export default router;
