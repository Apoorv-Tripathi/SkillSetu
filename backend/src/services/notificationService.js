import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmail } from "./emailService.js";

/**
 * Fires an in-app + email notification for one user. Best-effort: a failure
 * here (bad email, etc.) is logged but never bubbles up and breaks the
 * calling workflow (e.g. a milestone evaluation must still save).
 */
export async function notify(userId, { type, title, message, link }) {
  try {
    const notification = await Notification.create({ user: userId, type, title, message, link });

    const user = await User.findById(userId).select("email name");
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: `SkillSetu — ${title}`,
        text: `Hi ${user.name},\n\n${message}\n\n— SkillSetu`,
      });
    }

    return notification;
  } catch (err) {
    console.error("[notify] failed", err.message);
    return null;
  }
}
