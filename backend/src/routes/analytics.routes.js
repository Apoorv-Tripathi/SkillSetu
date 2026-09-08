import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getPlacementReadiness,
  getSkillDemandTrends,
  getInternshipOutcomes,
} from "../controllers/analytics.controller.js";

const router = Router();

router.use(authenticate);

router.get("/placement-readiness", getPlacementReadiness);
router.get("/skill-demand-trends", getSkillDemandTrends);
router.get("/internship-outcomes", getInternshipOutcomes);

export default router;
