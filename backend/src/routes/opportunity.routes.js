import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  createOpportunity,
  listOpportunities,
  getMyOpportunities,
  getOpportunity,
} from "../controllers/opportunity.controller.js";

const router = Router();

router.get("/", authenticate, listOpportunities);
router.get("/mine", authenticate, requireRole("industry", "recruiter"), getMyOpportunities);
router.get("/:id", authenticate, getOpportunity);
router.post("/", authenticate, requireRole("industry", "recruiter"), createOpportunity);

export default router;
