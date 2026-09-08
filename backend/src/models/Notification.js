import mongoose from "mongoose";
const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // e.g. "milestone_evaluated", "application_status"
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String }, // frontend route to deep-link into, e.g. "/applications"
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default model("Notification", notificationSchema);
