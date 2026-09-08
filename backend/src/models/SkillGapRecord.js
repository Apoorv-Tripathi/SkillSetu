import mongoose from "mongoose";
const { Schema, model } = mongoose;

const evidenceSchema = new Schema(
  {
    type: { type: String, enum: ["assessment", "mentor_evaluation"], required: true },
    score: { type: Number, required: true },
    weight: { type: Number, required: true },
    ref: { type: Schema.Types.ObjectId },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const skillGapRecordSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    skill: { type: Schema.Types.ObjectId, ref: "Skill", required: true },

    // currentScore is a weighted average across every piece of evidence —
    // mentor evaluations (real-world, verified) outweigh self-assessment.
    currentScore: { type: Number, min: 0, max: 5, required: true },
    targetScore: { type: Number, min: 0, max: 5, required: true },
    gap: { type: Number, required: true }, // targetScore - currentScore, can be negative
    status: { type: String, enum: ["met", "developing", "gap"], required: true },

    // Bounded trail of what produced the current score — this is what makes
    // the engine explainable rather than a black-box number.
    evidence: { type: [evidenceSchema], default: [] },

    lastEvidenceType: { type: String, enum: ["assessment", "mentor_evaluation"] },
  },
  { timestamps: true }
);

skillGapRecordSchema.index({ student: 1, skill: 1 }, { unique: true });

export default model("SkillGapRecord", skillGapRecordSchema);
