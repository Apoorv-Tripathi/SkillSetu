import CollaborationActivity from "../models/CollaborationActivity.js";
import {
  createCollaborationActivitySchema,
  applyToActivitySchema,
  respondToActivityApplicantSchema,
} from "../shared/validation/collaborationSchemas.js";
import { notify } from "../services/notificationService.js";

export async function createActivity(req, res, next) {
  try {
    const { error, value } = createCollaborationActivitySchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const activity = await CollaborationActivity.create({
      ...value,
      postedBy: req.user._id,
      postedByRole: req.user.role,
      institution: req.user.institution || req.user.institutionManaged,
    });

    res.status(201).json({ activity });
  } catch (err) {
    next(err);
  }
}

// Open marketplace listing — every role can browse every open activity,
// regardless of who posted it, since this is a cross-role marketplace.
export async function listOpenActivities(req, res, next) {
  try {
    const { type } = req.query;
    const filter = { status: "open" };
    if (type) filter.type = type;

    const activities = await CollaborationActivity.find(filter)
      .populate("postedBy", "name companyName")
      .populate("institution", "name")
      .sort({ createdAt: -1 });

    res.json({ activities });
  } catch (err) {
    next(err);
  }
}

export async function listMyActivities(req, res, next) {
  try {
    const activities = await CollaborationActivity.find({ postedBy: req.user._id })
      .populate("applicants.user", "name email role companyName")
      .sort({ createdAt: -1 });
    res.json({ activities });
  } catch (err) {
    next(err);
  }
}

export async function applyToActivity(req, res, next) {
  try {
    const { error, value } = applyToActivitySchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const activity = await CollaborationActivity.findById(req.params.id);
    if (!activity || activity.status !== "open") {
      return res.status(404).json({ error: "Activity not found or closed" });
    }
    if (activity.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot apply to your own posting" });
    }
    const already = activity.applicants.some((a) => a.user.toString() === req.user._id.toString());
    if (already) {
      return res.status(409).json({ error: "You have already applied to this activity" });
    }

    activity.applicants.push({ user: req.user._id, message: value.message });
    await activity.save();

    await notify(activity.postedBy, {
      type: "collaboration_applicant",
      title: "New applicant on your posting",
      message: `${req.user.name} applied to "${activity.title}".`,
      link: "/collaboration/mine",
    });

    res.status(201).json({ activity });
  } catch (err) {
    next(err);
  }
}

export async function respondToApplicant(req, res, next) {
  try {
    const { error, value } = respondToActivityApplicantSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const activity = await CollaborationActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });
    if (activity.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You do not own this posting" });
    }

    const applicant = activity.applicants.id(req.params.applicantId);
    if (!applicant) return res.status(404).json({ error: "Applicant not found" });

    applicant.status = value.status;
    await activity.save();

    await notify(applicant.user, {
      type: "collaboration_response",
      title: `Your application was ${value.status}`,
      message: `Your application to "${activity.title}" was ${value.status}.`,
      link: "/collaboration",
    });

    res.json({ activity });
  } catch (err) {
    next(err);
  }
}

export async function closeActivity(req, res, next) {
  try {
    const activity = await CollaborationActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });
    if (activity.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You do not own this posting" });
    }

    activity.status = "closed";
    await activity.save();
    res.json({ activity });
  } catch (err) {
    next(err);
  }
}
