import Institution from "../models/Institution.js";
import Skill from "../models/Skill.js";
import Assessment from "../models/Assessment.js";
import User from "../models/User.js";
import Opportunity from "../models/Opportunity.js";
import Application from "../models/Application.js";
import CollaborationActivity from "../models/CollaborationActivity.js";
import { institutionSchema, skillSchema, assessmentSchema } from "../shared/validation/adminSchemas.js";
import { computeSkillGapSummary } from "./institution.controller.js";

// ---- Platform-wide stats ----
export async function getPlatformStats(req, res, next) {
  try {
    const [usersByRole, institutionCount, opportunityCount, applicationCount, activityCount] = await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Institution.countDocuments(),
      Opportunity.countDocuments(),
      Application.countDocuments(),
      CollaborationActivity.countDocuments(),
    ]);

    res.json({
      usersByRole: Object.fromEntries(usersByRole.map((r) => [r._id, r.count])),
      institutionCount,
      opportunityCount,
      applicationCount,
      activityCount,
    });
  } catch (err) {
    next(err);
  }
}

// ---- Institutions CRUD ----
export async function listInstitutions(req, res, next) {
  try {
    const institutions = await Institution.find().sort({ name: 1 });
    res.json({ institutions });
  } catch (err) {
    next(err);
  }
}

export async function createInstitution(req, res, next) {
  try {
    const { error, value } = institutionSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });
    const institution = await Institution.create(value);
    res.status(201).json({ institution });
  } catch (err) {
    next(err);
  }
}

export async function updateInstitution(req, res, next) {
  try {
    const { error, value } = institutionSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });
    const institution = await Institution.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!institution) return res.status(404).json({ error: "Institution not found" });
    res.json({ institution });
  } catch (err) {
    next(err);
  }
}

// Per-institution drill-down — reuses the same aggregation the institution
// admin's own dashboard uses, just parameterized by :id instead of the
// caller's own institutionManaged.
export async function getInstitutionSkillGap(req, res, next) {
  try {
    const summary = await computeSkillGapSummary(req.params.id, req.query);
    res.json({ summary });
  } catch (err) {
    next(err);
  }
}

// ---- Skills CRUD ----
export async function listSkillsAdmin(req, res, next) {
  try {
    const skills = await Skill.find().sort({ category: 1, name: 1 });
    res.json({ skills });
  } catch (err) {
    next(err);
  }
}

export async function createSkill(req, res, next) {
  try {
    const { error, value } = skillSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });
    const skill = await Skill.create(value);
    res.status(201).json({ skill });
  } catch (err) {
    next(err);
  }
}

export async function updateSkill(req, res, next) {
  try {
    const { error, value } = skillSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });
    const skill = await Skill.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    res.json({ skill });
  } catch (err) {
    next(err);
  }
}

export async function deleteSkill(req, res, next) {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
}

// ---- Assessments CRUD ----
export async function listAssessmentsAdmin(req, res, next) {
  try {
    const assessments = await Assessment.find().populate("questions.skill", "name").sort({ createdAt: -1 });
    res.json({ assessments });
  } catch (err) {
    next(err);
  }
}

export async function createAssessment(req, res, next) {
  try {
    const { error, value } = assessmentSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });
    const assessment = await Assessment.create(value);
    res.status(201).json({ assessment });
  } catch (err) {
    next(err);
  }
}

export async function updateAssessment(req, res, next) {
  try {
    const { error, value } = assessmentSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });
    res.json({ assessment });
  } catch (err) {
    next(err);
  }
}

// ---- Users directory (read-only, for platform oversight) ----
export async function listUsers(req, res, next) {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select("name email role institution institutionManaged branch companyName isActive createdAt")
      .populate("institution", "name")
      .populate("institutionManaged", "name")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ users });
  } catch (err) {
    next(err);
  }
}
