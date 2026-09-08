import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  getSkillGapSummary,
  getFilterOptions,
  getBranchRoster,
  getCohortComparison,
} from "../controllers/institution.controller.js";

const router = Router();

router.get("/skill-gap-summary", authenticate, requireRole("institution_admin"), getSkillGapSummary);
router.get("/filter-options", authenticate, requireRole("institution_admin"), getFilterOptions);
router.get("/branches/:branch/roster", authenticate, requireRole("institution_admin"), getBranchRoster);
router.get("/cohort-comparison", authenticate, requireRole("institution_admin"), getCohortComparison);

export default router;
