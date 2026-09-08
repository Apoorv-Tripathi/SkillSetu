import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Institution from "../models/Institution.js";
import { signToken } from "../utils/jwt.js";
import { registerSchema, loginSchema } from "../shared/validation/authSchemas.js";

export async function register(req, res, next) {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const existing = await User.findOne({ email: value.email });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(value.password, 12);

    let institutionId;
    if (["student", "academician"].includes(value.role) && value.institutionName) {
      const institution = await Institution.findOneAndUpdate(
        { name: value.institutionName },
        { $setOnInsert: { name: value.institutionName } },
        { upsert: true, new: true }
      );
      institutionId = institution._id;
    }

    const user = await User.create({
      name: value.name,
      email: value.email,
      passwordHash,
      role: value.role,
      institution: institutionId,
      companyName: value.companyName,
      bio: value.bio,
      department: value.department,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const user = await User.findOne({ email: value.email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(value.password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: sanitize(req.user) });
}

function sanitize(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.passwordHash;
  return obj;
}
