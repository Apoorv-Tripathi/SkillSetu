import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { getMySkillGapView } from "../controllers/academician.controller.js";

const router = Router();

router.get("/skill-gap-view", authenticate, requireRole("academician"), getMySkillGapView);

export default router;
