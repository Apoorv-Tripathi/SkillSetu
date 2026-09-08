import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  createPortfolioItem,
  listMyPortfolio,
  listStudentPortfolio,
  listVerificationQueue,
  reviewPortfolioItem,
} from "../controllers/portfolio.controller.js";

const router = Router();

router.post("/", authenticate, requireRole("student"), createPortfolioItem);
router.get("/mine", authenticate, requireRole("student"), listMyPortfolio);
router.get(
  "/verification-queue",
  authenticate,
  requireRole("institution_admin", "platform_admin"),
  listVerificationQueue
);
router.patch("/:id/review", authenticate, requireRole("institution_admin", "platform_admin"), reviewPortfolioItem);
router.get("/student/:studentId", authenticate, requireRole("industry", "recruiter", "mentor"), listStudentPortfolio);

export default router;
