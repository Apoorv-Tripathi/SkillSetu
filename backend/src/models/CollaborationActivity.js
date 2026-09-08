import mongoose from "mongoose";
const { Schema, model } = mongoose;

const applicantSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    appliedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const collaborationActivitySchema = new Schema(
  {
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postedByRole: { type: String, enum: ["academician", "industry", "recruiter"], required: true },
    type: {
      type: String,
      enum: [
        "faculty_internship",
        "industrial_training",
        "fdp",
        "consultancy",
        "guest_lecture",
        "research_partnership",
        "innovation_challenge",
        "workshop",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    institution: { type: Schema.Types.ObjectId, ref: "Institution" },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    applicants: { type: [applicantSchema], default: [] },
  },
  { timestamps: true }
);

collaborationActivitySchema.index({ status: 1, type: 1 });

export default model("CollaborationActivity", collaborationActivitySchema);
