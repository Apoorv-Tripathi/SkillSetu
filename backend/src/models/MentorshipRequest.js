import mongoose from "mongoose";
const { Schema, model } = mongoose;

const mentorshipRequestSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mentor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

mentorshipRequestSchema.index({ student: 1, mentor: 1, status: 1 });

export default model("MentorshipRequest", mentorshipRequestSchema);
