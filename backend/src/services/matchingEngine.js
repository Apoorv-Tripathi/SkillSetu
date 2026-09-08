import SkillGapRecord from "../models/SkillGapRecord.js";

// Deterministic scoring — never LLM-decided. A met requirement is worth a
// full point, a weak-but-close one half a point, a missing skill nothing.
const POINTS = { met: 1, weak: 0.5, missing: 0 };

function classifyAgainstRequirement(current, required) {
  const diff = current - required;
  if (diff >= 0) return "met";
  if (diff >= -1) return "weak";
  return "missing";
}

/**
 * Computes an explainable match score between one student and one
 * opportunity's required skills, using the student's current skill-gap
 * heatmap as the evidence source.
 */
export async function computeMatch(studentId, requiredSkills) {
  const records = await SkillGapRecord.find({
    student: studentId,
    skill: { $in: requiredSkills.map((r) => r.skill) },
  });
  const currentBySkill = new Map(records.map((r) => [r.skill.toString(), r.currentScore]));

  const breakdown = requiredSkills.map((req) => {
    const skillId = req.skill.toString();
    const current = currentBySkill.get(skillId) ?? 0;
    const status = classifyAgainstRequirement(current, req.minProficiency);
    return {
      skill: req.skill,
      required: req.minProficiency,
      current,
      status,
    };
  });

  const maxPoints = breakdown.length;
  const earnedPoints = breakdown.reduce((sum, row) => sum + POINTS[row.status], 0);
  const overallScore = maxPoints === 0 ? 0 : Math.round((earnedPoints / maxPoints) * 100);

  return { overallScore, breakdown };
}

/** Human-readable one-liner per row, used by the frontend "why this match" view. */
export function explainRow(row, skillName) {
  if (row.status === "met") {
    return `${skillName}: meets requirement (${row.current}/5 vs required ${row.required}/5)`;
  }
  if (row.status === "weak") {
    return `${skillName}: close but below requirement (${row.current}/5 vs required ${row.required}/5)`;
  }
  return `${skillName}: no sufficient evidence yet (${row.current}/5 vs required ${row.required}/5)`;
}
