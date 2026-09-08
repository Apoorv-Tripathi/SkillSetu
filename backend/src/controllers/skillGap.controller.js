import { recomputeSkillGap } from "../services/skillGapEngine.js";

// Recomputes on read so the heatmap is always current even if a caller hits
// this endpoint without having just submitted new evidence.
export async function getMySkillGap(req, res, next) {
  try {
    const heatmap = await recomputeSkillGap(req.user._id);
    res.json({ heatmap });
  } catch (err) {
    next(err);
  }
}
