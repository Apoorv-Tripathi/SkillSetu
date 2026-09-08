import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { listMyNotifications, markRead, markAllRead } from "../controllers/notification.controller.js";

const router = Router();

router.get("/", authenticate, listMyNotifications);
router.patch("/:id/read", authenticate, markRead);
router.patch("/read-all", authenticate, markAllRead);

export default router;
