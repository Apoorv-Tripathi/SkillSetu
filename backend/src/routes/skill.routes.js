import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { listSkills } from "../controllers/skill.controller.js";

const router = Router();

router.get("/", authenticate, listSkills);

export default router;
