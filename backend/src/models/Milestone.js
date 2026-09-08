import mongoose from "mongoose";
const { Schema, model } = mongoose;

const skillEvaluationSchema = new Schema(
  {
    skill: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    score: { type: Number, min: 0, max: 5, required: true },
    comment: { type: String },
  },
  { _id: false }
);

const milestoneSchema = new Schema(
  {
    application: { type: Schema.Types.ObjectId, ref: "Application", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true }, // denormalized for fast lookups
    mentor: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },

    status: { type: String, enum: ["pending", "evaluated"], default: "pending" },

    skillEvaluations: { type: [skillEvaluationSchema], default: [] },
    overallFeedback: { type: String },
    evaluatedAt: { type: Date },
  },
  { timestamps: true }
);

export default model("Milestone", milestoneSchema);
