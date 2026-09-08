import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { listAssessments, getAssessment, submitAssessment } from "../controllers/assessment.controller.js";

const router = Router();

router.get("/", authenticate, listAssessments);
router.get("/:id", authenticate, getAssessment);
router.post("/:id/submit", authenticate, requireRole("student"), submitAssessment);

export default router;
