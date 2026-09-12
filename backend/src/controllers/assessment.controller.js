import Assessment from "../models/Assessment.js";
import AssessmentResult from "../models/AssessmentResult.js";
import { submitAssessmentSchema } from "../shared/validation/assessmentSchemas.js";
import { recomputeSkillGap } from "../services/skillGapEngine.js";

export async function listAssessments(req, res, next) {
  try {
    const assessments = await Assessment.find({ isActive: true }).select("title description category durationMinutes questions createdAt");
    res.json({ assessments });
  } catch (err) {
    next(err);
  }
}

// Returns the assessment for TAKING it — option scores are stripped so the
// answer key never reaches the client. Scoring happens server-side on submit.
export async function getAssessment(req, res, next) {
  try {
    const assessment = await Assessment.findById(req.params.id).populate("questions.skill", "name category");
    if (!assessment || !assessment.isActive) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const sanitized = {
      _id: assessment._id,
      title: assessment.title,
      description: assessment.description,
      questions: assessment.questions.map((q, index) => ({
        index,
        text: q.text,
        skill: q.skill,
        options: q.options.map((o, i) => ({ index: i, text: o.text })),
      })),
    };

    res.json({ assessment: sanitized });
  } catch (err) {
    next(err);
  }
}

export async function submitAssessment(req, res, next) {
  try {
    const { error, value } = submitAssessmentSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment || !assessment.isActive) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Score is looked up server-side from the stored question/option — the
    // client only ever sent index choices, never a score.
    const skillTotals = new Map();

    for (const answer of value.answers) {
      const question = assessment.questions[answer.questionIndex];
      if (!question) continue;
      const option = question.options[answer.selectedOptionIndex];
      if (!option) continue;

      const skillId = question.skill.toString();
      const entry = skillTotals.get(skillId) || { total: 0, count: 0 };
      entry.total += option.score;
      entry.count += 1;
      skillTotals.set(skillId, entry);
    }

    if (skillTotals.size === 0) {
      return res.status(400).json({ error: "No valid answers were submitted" });
    }

    const skillScores = Array.from(skillTotals.entries()).map(([skill, { total, count }]) => ({
      skill,
      score: Math.round((total / count) * 10) / 10,
    }));

    const result = await AssessmentResult.create({
      student: req.user._id,
      assessment: assessment._id,
      skillScores,
    });

    const populated = await result.populate("skillScores.skill", "name category");
    await recomputeSkillGap(req.user._id);
    res.status(201).json({ result: populated });
  } catch (err) {
    next(err);
  }
}
