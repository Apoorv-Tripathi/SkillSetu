import mongoose from "mongoose";
const { Schema, model } = mongoose;

const questionSchema = new Schema(
  {
    text: { type: String, required: true },
    skill: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    options: [{ text: String, score: Number }],
  },
  { _id: false }
);

const assessmentSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ["technical", "soft_skill", "aptitude", "domain"],
      default: "technical",
    },
    durationMinutes: { type: Number, default: 20 },
    passingScore: { type: Number, default: 2.5 },
    questions: { type: [questionSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model("Assessment", assessmentSchema);
