import { computeSkillGapSummary } from "./institution.controller.js";

// Academicians see the same kind of skill-gap read as an institution admin,
// but scoped to their own institution and, when they've set a department,
// narrowed to the branch matching it — they don't manage the whole college.
export async function getMySkillGapView(req, res, next) {
  try {
    if (!req.user.institution) {
      return res.status(400).json({ error: "No institution is linked to this account" });
    }

    const filters = {};
    if (req.user.department) filters.branch = req.user.department;

    const summary = await computeSkillGapSummary(req.user.institution, filters);
    res.json({ summary, scopedToBranch: req.user.department || null });
  } catch (err) {
    next(err);
  }
}
