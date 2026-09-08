import User from "../models/User.js";
import MentorshipRequest from "../models/MentorshipRequest.js";
import {
  createMentorshipRequestSchema,
  respondMentorshipRequestSchema,
} from "../shared/validation/mentorshipSchemas.js";
import { notify } from "../services/notificationService.js";

export async function listMentors(req, res, next) {
  try {
    const mentors = await User.find({ role: "mentor", isActive: true })
      .select("name bio expertiseSkills")
      .populate("expertiseSkills", "name category");
    res.json({ mentors });
  } catch (err) {
    next(err);
  }
}

export async function createMentorshipRequest(req, res, next) {
  try {
    const { error, value } = createMentorshipRequestSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const mentor = await User.findOne({ _id: value.mentor, role: "mentor" });
    if (!mentor) return res.status(404).json({ error: "Mentor not found" });

    const request = await MentorshipRequest.create({
      student: req.user._id,
      mentor: mentor._id,
      message: value.message,
    });

    const populated = await request.populate("mentor", "name bio");

    await notify(mentor._id, {
      type: "mentorship_request",
      title: "New mentorship request",
      message: `${req.user.name} requested your mentorship: "${value.message}"`,
      link: "/mentor/requests",
    });

    res.status(201).json({ request: populated });
  } catch (err) {
    next(err);
  }
}

export async function listMyRequests(req, res, next) {
  try {
    const requests = await MentorshipRequest.find({ student: req.user._id })
      .populate("mentor", "name bio")
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    next(err);
  }
}

export async function listIncomingRequests(req, res, next) {
  try {
    const requests = await MentorshipRequest.find({ mentor: req.user._id })
      .populate("student", "name email branch institution")
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    next(err);
  }
}

export async function respondToRequest(req, res, next) {
  try {
    const { error, value } = respondMentorshipRequestSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "This request was not sent to you" });
    }

    request.status = value.status;
    request.respondedAt = new Date();
    await request.save();

    const populated = await request.populate("student", "name email branch");

    await notify(request.student, {
      type: "mentorship_response",
      title: `Mentorship request ${value.status}`,
      message: `Your mentorship request was ${value.status}.`,
      link: "/mentors",
    });

    res.json({ request: populated });
  } catch (err) {
    next(err);
  }
}
