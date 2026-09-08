import mongoose from "mongoose";
const { Schema, model } = mongoose;

const requiredSkillSchema = new Schema(
  {
    skill: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    minProficiency: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false }
);

const opportunitySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "internship",
        "job",
        "live_project",
        "apprenticeship",
        "training_program",
        "certification_course",
        "workshop",
      ],
      default: "internship",
    },
    description: { type: String, required: true },
    requiredSkills: { type: [requiredSkillSchema], default: [] },
    location: String,
    isRemote: { type: Boolean, default: false },
    stipend: { type: String, default: "Unpaid / Performance-based" },
    duration: { type: String, default: "3 Months" },
    eligibility: {
      minGpa: { type: Number, default: 0 },
      eligibleBranches: { type: [String], default: [] },
      graduationYears: { type: [Number], default: [] },
    },
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

opportunitySchema.index({ postedBy: 1, status: 1 });

export default model("Opportunity", opportunitySchema);
