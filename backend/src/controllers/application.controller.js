import Application from "../models/Application.js";
import Opportunity from "../models/Opportunity.js";
import { computeMatch } from "../services/matchingEngine.js";
import { updateApplicationStatusSchema, addFeedbackSchema } from "../shared/validation/applicationSchemas.js";
import { notify } from "../services/notificationService.js";

export async function applyToOpportunity(req, res, next) {
  try {
    const opportunity = await Opportunity.findById(req.params.opportunityId);
    if (!opportunity || opportunity.status !== "open") {
      return res.status(404).json({ error: "Opportunity not found or closed" });
    }

    const existing = await Application.findOne({ student: req.user._id, opportunity: opportunity._id });
    if (existing) {
      return res.status(409).json({ error: "You have already applied to this opportunity" });
    }

    const { overallScore, breakdown } = await computeMatch(req.user._id, opportunity.requiredSkills);

    const application = await Application.create({
      student: req.user._id,
      opportunity: opportunity._id,
      matchScore: overallScore,
      matchBreakdown: breakdown,
    });

    const populated = await application.populate([
      { path: "opportunity", select: "title companyName type" },
      { path: "matchBreakdown.skill", select: "name category" },
    ]);

    res.status(201).json({ application: populated });
  } catch (err) {
    next(err);
  }
}

export async function listMyApplications(req, res, next) {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("opportunity", "title companyName type")
      .populate("matchBreakdown.skill", "name category")
      .populate("mentor", "name email")
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
}

export async function listApplicationsForOpportunity(req, res, next) {
  try {
    const opportunity = await Opportunity.findById(req.params.opportunityId);
    if (!opportunity) return res.status(404).json({ error: "Opportunity not found" });
    if (opportunity.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You do not own this opportunity" });
    }

    const applications = await Application.find({ opportunity: opportunity._id })
      .populate("student", "name email branch graduationYear institution")
      .populate("matchBreakdown.skill", "name category")
      .populate("mentor", "name email")
      .populate("feedback.reviewer", "name")
      .sort({ matchScore: -1 });

    res.json({ opportunity: { _id: opportunity._id, title: opportunity.title }, applications });
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationStatus(req, res, next) {
  try {
    const { error, value } = updateApplicationStatusSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const application = await Application.findById(req.params.id).populate("opportunity");
    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.opportunity.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You do not own this opportunity" });
    }

    application.status = value.status;
    application.timeline.push({ status: value.status, note: value.note });
    if (value.mentor) application.mentor = value.mentor;

    await application.save();
    const populated = await application.populate([
      { path: "student", select: "name email" },
      { path: "mentor", select: "name email" },
    ]);

    await notify(application.student, {
      type: "application_status",
      title: `Application ${value.status}`,
      message: `Your application for "${application.opportunity.title}" moved to "${value.status}".${
        value.note ? ` Note: ${value.note}` : ""
      }`,
      link: "/applications",
    });

    res.json({ application: populated });
  } catch (err) {
    next(err);
  }
}

// Recruiter shortlisting tool — a personal bookmark independent of pipeline
// status, so a reviewer can flag standouts before making a status decision.
export async function toggleStar(req, res, next) {
  try {
    const application = await Application.findById(req.params.id).populate("opportunity");
    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.opportunity.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You do not own this opportunity" });
    }

    application.starred = !application.starred;
    await application.save();
    res.json({ application: { _id: application._id, starred: application.starred } });
  } catch (err) {
    next(err);
  }
}

// Structured (manual, non-AI) feedback — every reviewer's rating + notes are
// appended, never overwritten, so a full review trail is preserved.
export async function addFeedback(req, res, next) {
  try {
    const { error, value } = addFeedbackSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const application = await Application.findById(req.params.id).populate("opportunity");
    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.opportunity.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You do not own this opportunity" });
    }

    application.feedback.push({ reviewer: req.user._id, rating: value.rating, notes: value.notes });
    await application.save();

    const populated = await application.populate("feedback.reviewer", "name");
    res.status(201).json({ feedback: populated.feedback });
  } catch (err) {
    next(err);
  }
}
