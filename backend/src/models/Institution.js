import mongoose from "mongoose";
const { Schema, model } = mongoose;

const institutionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["engineering", "polytechnic", "university", "medical", "ayush", "other"],
      default: "engineering",
    },
    city: String,
    state: String,
    branches: [{ type: String }],
    isSeedData: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("Institution", institutionSchema);
