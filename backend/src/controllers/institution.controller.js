import SkillGapRecord from "../models/SkillGapRecord.js";
import User from "../models/User.js";

// Shared aggregation core, reused by the institution admin's own dashboard
// and by the platform admin's per-institution drill-down. `extraMatch` lets
// callers add branch/graduationYear filters without duplicating the pipeline.
export async function computeSkillGapSummary(institutionId, { branch, graduationYear } = {}) {
  const studentMatch = { "studentDoc.institution": institutionId };
  if (branch) studentMatch["studentDoc.branch"] = branch;
  if (graduationYear) studentMatch["studentDoc.graduationYear"] = Number(graduationYear);

  const rows = await SkillGapRecord.aggregate([
    { $lookup: { from: "users", localField: "student", foreignField: "_id", as: "studentDoc" } },
    { $unwind: "$studentDoc" },
    { $match: studentMatch },
    { $lookup: { from: "skills", localField: "skill", foreignField: "_id", as: "skillDoc" } },
    { $unwind: "$skillDoc" },
    {
      $group: {
        _id: { branch: "$studentDoc.branch", skill: "$skillDoc.name", category: "$skillDoc.category" },
        avgCurrent: { $avg: "$currentScore" },
        avgTarget: { $avg: "$targetScore" },
        avgGap: { $avg: "$gap" },
        studentCount: { $sum: 1 },
      },
    },
    { $sort: { "_id.branch": 1, avgGap: -1 } },
  ]);

  const byBranch = new Map();
  for (const row of rows) {
    const branchName = row._id.branch || "Unassigned";
    const entry = byBranch.get(branchName) || [];
    entry.push({
      skill: row._id.skill,
      category: row._id.category,
      avgCurrent: Math.round(row.avgCurrent * 10) / 10,
      avgTarget: Math.round(row.avgTarget * 10) / 10,
      avgGap: Math.round(row.avgGap * 10) / 10,
      studentCount: row.studentCount,
    });
    byBranch.set(branchName, entry);
  }

  return Array.from(byBranch.entries()).map(([branch, skills]) => ({ branch, skills }));
}

export async function getSkillGapSummary(req, res, next) {
  try {
    const institutionId = req.user.institutionManaged;
    if (!institutionId) {
      return res.status(400).json({ error: "No institution is assigned to this admin account" });
    }
    const { branch, graduationYear } = req.query;
    const summary = await computeSkillGapSummary(institutionId, { branch, graduationYear });
    res.json({ summary });
  } catch (err) {
    next(err);
  }
}

// Available filter values, so the frontend can render real dropdowns instead
// of free-text filters.
export async function getFilterOptions(req, res, next) {
  try {
    const institutionId = req.user.institutionManaged;
    if (!institutionId) {
      return res.status(400).json({ error: "No institution is assigned to this admin account" });
    }

    const [branches, graduationYears] = await Promise.all([
      User.distinct("branch", { institution: institutionId, role: "student" }),
      User.distinct("graduationYear", { institution: institutionId, role: "student" }),
    ]);

    res.json({
      branches: branches.filter(Boolean).sort(),
      graduationYears: graduationYears.filter(Boolean).sort((a, b) => a - b),
    });
  } catch (err) {
    next(err);
  }
}

// Drill-down — the actual student roster behind one branch (and optionally
// one cohort), each with a one-line skill-gap read so an admin can act on
// individuals, not just aggregates.
export async function getBranchRoster(req, res, next) {
  try {
    const institutionId = req.user.institutionManaged;
    if (!institutionId) {
      return res.status(400).json({ error: "No institution is assigned to this admin account" });
    }
    const { branch } = req.params;
    const { graduationYear } = req.query;

    const studentFilter = { institution: institutionId, role: "student", branch };
    if (graduationYear) studentFilter.graduationYear = Number(graduationYear);

    const students = await User.find(studentFilter).select("name email branch graduationYear");
    const studentIds = students.map((s) => s._id);

    const gapCounts = await SkillGapRecord.aggregate([
      { $match: { student: { $in: studentIds } } },
      { $group: { _id: { student: "$student", status: "$status" }, count: { $sum: 1 } } },
    ]);

    const byStudent = new Map();
    for (const row of gapCounts) {
      const key = row._id.student.toString();
      const entry = byStudent.get(key) || { met: 0, developing: 0, gap: 0 };
      entry[row._id.status] = row.count;
      byStudent.set(key, entry);
    }

    const roster = students.map((s) => ({
      _id: s._id,
      name: s.name,
      email: s.email,
      graduationYear: s.graduationYear,
      skillCounts: byStudent.get(s._id.toString()) || { met: 0, developing: 0, gap: 0 },
    }));

    res.json({ branch, roster });
  } catch (err) {
    next(err);
  }
}

// Cohort comparison — average gap per graduation year per branch, the view
// that answers "is this year's cohort better or worse than last year's?"
export async function getCohortComparison(req, res, next) {
  try {
    const institutionId = req.user.institutionManaged;
    if (!institutionId) {
      return res.status(400).json({ error: "No institution is assigned to this admin account" });
    }

    const rows = await SkillGapRecord.aggregate([
      { $lookup: { from: "users", localField: "student", foreignField: "_id", as: "studentDoc" } },
      { $unwind: "$studentDoc" },
      { $match: { "studentDoc.institution": institutionId } },
      {
        $group: {
          _id: { branch: "$studentDoc.branch", graduationYear: "$studentDoc.graduationYear" },
          avgGap: { $avg: "$gap" },
          studentCount: { $addToSet: "$student" },
        },
      },
      {
        $project: {
          branch: "$_id.branch",
          graduationYear: "$_id.graduationYear",
          avgGap: { $round: ["$avgGap", 1] },
          studentCount: { $size: "$studentCount" },
        },
      },
      { $sort: { branch: 1, graduationYear: 1 } },
    ]);

    res.json({ cohorts: rows });
  } catch (err) {
    next(err);
  }
}
