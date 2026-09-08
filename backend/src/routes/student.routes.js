import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  getMySkillProfile,
  getCareerRoadmap,
  updateCareerInterests,
} from "../controllers/student.controller.js";
import { getMySkillGap } from "../controllers/skillGap.controller.js";

const router = Router();

router.get("/me/skill-profile", authenticate, requireRole("student"), getMySkillProfile);
router.get("/me/skill-gap", authenticate, requireRole("student"), getMySkillGap);
router.get("/me/career-roadmap", authenticate, requireRole("student"), getCareerRoadmap);
router.patch("/me/career-interests", authenticate, requireRole("student"), updateCareerInterests);

export default router;
