import mongoose from "mongoose";
import { ROLES } from "../shared/constants/roles.js";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), required: true },

    // Student
    institution: { type: Schema.Types.ObjectId, ref: "Institution" },
    branch: { type: String },
    graduationYear: { type: Number },
    careerInterests: { type: [String], default: [] },
    targetRoles: { type: [String], default: [] },

    // Industry
    companyName: { type: String },
    designation: { type: String },

    // Institution Admin
    institutionManaged: { type: Schema.Types.ObjectId, ref: "Institution" },

    // Academician
    department: { type: String },

    // Mentor
    bio: { type: String },
    expertiseSkills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ institution: 1, branch: 1 });

export default model("User", userSchema);
