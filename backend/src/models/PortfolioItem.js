import mongoose from "mongoose";
const { Schema, model } = mongoose;

const portfolioItemSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "certificate",
        "project",
        "document",
        "resume",
        "internship_report",
        "achievement",
        "academic_record",
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    issuer: { type: String },
    credentialId: { type: String },
    skillsDemonstrated: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    link: { type: String },
    dateIssued: { type: Date },

    // Manual/institutional review workflow. New items start "pending" so an
    // institution admin has a real queue to work through; "unverified" is
    // reserved for items an admin looked at and couldn't confirm.
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "unverified"],
      default: "pending",
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: { type: String },
  },
  { timestamps: true }
);

export default model("PortfolioItem", portfolioItemSchema);
