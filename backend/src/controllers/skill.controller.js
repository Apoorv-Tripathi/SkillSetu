import Skill from "../models/Skill.js";

export async function listSkills(req, res, next) {
  try {
    const skills = await Skill.find().sort({ name: 1 });
    res.json({ skills });
  } catch (err) {
    next(err);
  }
}
