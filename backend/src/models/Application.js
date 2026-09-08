import mongoose from "mongoose";
const { Schema, model } = mongoose;

const breakdownRowSchema = new Schema(
  {
    skill: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    required: { type: Number, required: true },
    current: { type: Number, required: true },
    status: { type: String, enum: ["met", "weak", "missing"], required: true },
  },
  { _id: false }
);

const timelineEntrySchema = new Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const feedbackEntrySchema = new Schema(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    notes: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    opportunity: { type: Schema.Types.ObjectId, ref: "Opportunity", required: true },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interview", "offer", "rejected"],
      default: "applied",
    },

    // Snapshot of the explainable match score at the moment of applying —
    // this is what the "why this match" view is built from.
    matchScore: { type: Number, required: true },
    matchBreakdown: { type: [breakdownRowSchema], default: [] },

    timeline: { type: [timelineEntrySchema], default: () => [{ status: "applied" }] },

    mentor: { type: Schema.Types.ObjectId, ref: "User" },

    // Recruiter tooling — a personal bookmark independent of pipeline status,
    // and a structured (manual, non-AI) feedback trail from every reviewer.
    starred: { type: Boolean, default: false },
    feedback: { type: [feedbackEntrySchema], default: [] },
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, opportunity: 1 }, { unique: true });
applicationSchema.index({ opportunity: 1, status: 1 });

export default model("Application", applicationSchema);
