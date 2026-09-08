import mongoose from "mongoose";
const { Schema, model } = mongoose;

const skillSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true },
    skillType: {
      type: String,
      enum: ["technical", "soft_skill", "aptitude", "domain"],
      default: "technical",
    },
    description: String,
    // Industry-expected baseline proficiency (0-5) used as the target line
    // in the skill-gap engine when a specific opportunity isn't the context.
    expectedProficiency: { type: Number, min: 0, max: 5, default: 3.5 },
  },
  { timestamps: true }
);

export default model("Skill", skillSchema);
