import Milestone from "../models/Milestone.js";
import Application from "../models/Application.js";
import { createMilestoneSchema, submitEvaluationSchema } from "../shared/validation/milestoneSchemas.js";
import { recomputeSkillGap } from "../services/skillGapEngine.js";
import { notify } from "../services/notificationService.js";

export async function createMilestone(req, res, next) {
  try {
    const { error, value } = createMilestoneSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const application = await Application.findById(value.application).populate("opportunity");
    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.opportunity.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You do not own this opportunity" });
    }
    if (!["interview", "offer"].includes(application.status)) {
      return res.status(400).json({ error: "Milestones can only be created once an application reaches interview or offer stage" });
    }

    const milestone = await Milestone.create({
      application: application._id,
      student: application.student,
      mentor: value.mentor,
      title: value.title,
      description: value.description,
      dueDate: value.dueDate,
    });

    if (!application.mentor) {
      application.mentor = value.mentor;
      await application.save();
    }

    const populated = await milestone.populate("mentor", "name email");

    await notify(value.mentor, {
      type: "milestone_assigned",
      title: "New milestone assigned",
      message: `You've been asked to evaluate "${value.title}" for a student's internship.`,
      link: "/mentor/dashboard",
    });
    await notify(application.student, {
      type: "milestone_created",
      title: "New milestone added",
      message: `A new milestone "${value.title}" was added to your application for "${application.opportunity.title}".`,
      link: "/applications",
    });

    res.status(201).json({ milestone: populated });
  } catch (err) {
    next(err);
  }
}

export async function listMyMentorAssignments(req, res, next) {
  try {
    const milestones = await Milestone.find({ mentor: req.user._id })
      .populate("student", "name email branch")
      .populate("skillEvaluations.skill", "name category")
      .populate({ path: "application", populate: { path: "opportunity", select: "title companyName" } })
      .sort({ status: 1, dueDate: 1 });
    res.json({ milestones });
  } catch (err) {
    next(err);
  }
}

export async function listMilestonesForApplication(req, res, next) {
  try {
    const application = await Application.findById(req.params.applicationId).populate("opportunity");
    if (!application) return res.status(404).json({ error: "Application not found" });

    const isOwnerStudent = application.student.toString() === req.user._id.toString();
    const isOwnerIndustry = application.opportunity.postedBy.toString() === req.user._id.toString();
    if (!isOwnerStudent && !isOwnerIndustry) {
      return res.status(403).json({ error: "Not authorized to view these milestones" });
    }

    const milestones = await Milestone.find({ application: application._id })
      .populate("mentor", "name email")
      .populate("skillEvaluations.skill", "name category")
      .sort({ createdAt: 1 });

    res.json({ milestones });
  } catch (err) {
    next(err);
  }
}

// The single most important write path in the product: a mentor's live
// evaluation immediately recomputes the student's skill-gap heatmap.
export async function submitEvaluation(req, res, next) {
  try {
    const { error, value } = submitEvaluationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ error: "Milestone not found" });
    if (milestone.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You are not the assigned mentor for this milestone" });
    }

    milestone.skillEvaluations = value.skillEvaluations;
    milestone.overallFeedback = value.overallFeedback;
    milestone.status = "evaluated";
    milestone.evaluatedAt = new Date();
    await milestone.save();

    const heatmap = await recomputeSkillGap(milestone.student);

    await notify(milestone.student, {
      type: "milestone_evaluated",
      title: "Your milestone was evaluated",
      message: `"${milestone.title}" was evaluated by your mentor — your skill-gap heatmap just updated.`,
      link: "/skill-gap",
    });

    const populated = await milestone.populate("skillEvaluations.skill", "name category");
    res.json({ milestone: populated, updatedHeatmap: heatmap });
  } catch (err) {
    next(err);
  }
}
