import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  listMentors,
  createMentorshipRequest,
  listMyRequests,
  listIncomingRequests,
  respondToRequest,
} from "../controllers/mentorship.controller.js";

const router = Router();

router.get("/mentors", authenticate, listMentors);
router.post("/requests", authenticate, requireRole("student"), createMentorshipRequest);
router.get("/requests/mine", authenticate, requireRole("student"), listMyRequests);
router.get("/requests/incoming", authenticate, requireRole("mentor"), listIncomingRequests);
router.patch("/requests/:id/respond", authenticate, requireRole("mentor"), respondToRequest);

export default router;
