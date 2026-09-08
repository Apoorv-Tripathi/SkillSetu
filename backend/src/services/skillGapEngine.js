import AssessmentResult from "../models/AssessmentResult.js";
import Milestone from "../models/Milestone.js";
import Skill from "../models/Skill.js";
import SkillGapRecord from "../models/SkillGapRecord.js";

// Mentor evaluations are real-world, verified evidence — they count for more
// than a self-administered assessment. Weights are deliberately simple and
// visible, not a tuned ML score, so the "why" is always inspectable.
const EVIDENCE_WEIGHT = {
  assessment: 1,
  mentor_evaluation: 2.5,
};

const DEFAULT_TARGET = 3.5;

function classify(gap) {
  if (gap <= 0) return "met";
  if (gap <= 1.5) return "developing";
  return "gap";
}

/**
 * Recomputes and persists the full skill-gap heatmap for one student.
 * Called after any new evidence lands: an assessment submission or a mentor
 * milestone evaluation. Returns the heatmap sorted by worst gap first.
 */
export async function recomputeSkillGap(studentId) {
  const [assessmentResults, evaluatedMilestones] = await Promise.all([
    AssessmentResult.find({ student: studentId }),
    Milestone.find({ student: studentId, status: "evaluated" }),
  ]);

  // skillId (string) -> { entries: [{score, weight, type, ref, at}] }
  const bySkill = new Map();

  function addEvidence(skillId, entry) {
    const key = skillId.toString();
    const bucket = bySkill.get(key) || [];
    bucket.push(entry);
    bySkill.set(key, bucket);
  }

  for (const result of assessmentResults) {
    for (const { skill, score } of result.skillScores) {
      addEvidence(skill, {
        type: "assessment",
        score,
        weight: EVIDENCE_WEIGHT.assessment,
        ref: result._id,
        at: result.completedAt,
      });
    }
  }

  for (const milestone of evaluatedMilestones) {
    for (const { skill, score } of milestone.skillEvaluations) {
      addEvidence(skill, {
        type: "mentor_evaluation",
        score,
        weight: EVIDENCE_WEIGHT.mentor_evaluation,
        ref: milestone._id,
        at: milestone.evaluatedAt,
      });
    }
  }

  if (bySkill.size === 0) {
    return [];
  }

  const skillIds = Array.from(bySkill.keys());
  const skills = await Skill.find({ _id: { $in: skillIds } });
  const skillById = new Map(skills.map((s) => [s._id.toString(), s]));

  const ops = [];
  const results = [];

  for (const [skillId, evidence] of bySkill.entries()) {
    const skill = skillById.get(skillId);
    if (!skill) continue;

    const weightSum = evidence.reduce((sum, e) => sum + e.weight, 0);
    const weightedScoreSum = evidence.reduce((sum, e) => sum + e.score * e.weight, 0);
    const currentScore = Math.round((weightedScoreSum / weightSum) * 10) / 10;
    const targetScore = skill.expectedProficiency ?? DEFAULT_TARGET;
    const gap = Math.round((targetScore - currentScore) * 10) / 10;
    const status = classify(gap);
    const lastEvidenceType = evidence.sort((a, b) => new Date(b.at) - new Date(a.at))[0].type;

    const doc = {
      student: studentId,
      skill: skill._id,
      currentScore,
      targetScore,
      gap,
      status,
      evidence: evidence.slice(-10), // keep the trail bounded but real
      lastEvidenceType,
    };

    ops.push({
      updateOne: {
        filter: { student: studentId, skill: skill._id },
        update: { $set: doc },
        upsert: true,
      },
    });

    results.push({ ...doc, skill });
  }

  if (ops.length > 0) {
    await SkillGapRecord.bulkWrite(ops);
  }

  return results.sort((a, b) => b.gap - a.gap);
}
