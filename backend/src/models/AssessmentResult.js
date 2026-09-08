import mongoose from "mongoose";
const { Schema, model } = mongoose;

const skillScoreSchema = new Schema(
  {
    skill: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    score: { type: Number, min: 0, max: 5, required: true },
  },
  { _id: false }
);

const assessmentResultSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assessment: { type: Schema.Types.ObjectId, ref: "Assessment", required: true },
    skillScores: { type: [skillScoreSchema], default: [] },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model("AssessmentResult", assessmentResultSchema);
