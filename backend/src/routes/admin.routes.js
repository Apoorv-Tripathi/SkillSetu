import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  getPlatformStats,
  listInstitutions,
  createInstitution,
  updateInstitution,
  getInstitutionSkillGap,
  listSkillsAdmin,
  createSkill,
  updateSkill,
  deleteSkill,
  listAssessmentsAdmin,
  createAssessment,
  updateAssessment,
  listUsers,
} from "../controllers/admin.controller.js";

const router = Router();
router.use(authenticate, requireRole("platform_admin"));

router.get("/stats", getPlatformStats);
router.get("/users", listUsers);

router.get("/institutions", listInstitutions);
router.post("/institutions", createInstitution);
router.patch("/institutions/:id", updateInstitution);
router.get("/institutions/:id/skill-gap", getInstitutionSkillGap);

router.get("/skills", listSkillsAdmin);
router.post("/skills", createSkill);
router.patch("/skills/:id", updateSkill);
router.delete("/skills/:id", deleteSkill);

router.get("/assessments", listAssessmentsAdmin);
router.post("/assessments", createAssessment);
router.patch("/assessments/:id", updateAssessment);

export default router;
