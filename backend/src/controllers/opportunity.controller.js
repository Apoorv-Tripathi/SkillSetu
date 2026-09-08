import Opportunity from "../models/Opportunity.js";
import { createOpportunitySchema } from "../shared/validation/opportunitySchemas.js";

export async function createOpportunity(req, res, next) {
  try {
    const { error, value } = createOpportunitySchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }

    const opportunity = await Opportunity.create({
      ...value,
      postedBy: req.user._id,
      companyName: req.user.companyName,
    });

    res.status(201).json({ opportunity });
  } catch (err) {
    next(err);
  }
}

export async function listOpportunities(req, res, next) {
  try {
    const query = { status: "open" };
    if (req.query.type) {
      if (req.query.type === "learning") {
        query.type = { $in: ["training_program", "certification_course", "workshop"] };
      } else if (req.query.type === "internship") {
        query.type = { $in: ["internship", "apprenticeship", "live_project"] };
      } else {
        query.type = req.query.type;
      }
    }
    const opportunities = await Opportunity.find(query)
      .populate("requiredSkills.skill", "name category skillType")
      .sort({ createdAt: -1 });
    res.json({ opportunities });
  } catch (err) {
    next(err);
  }
}

export async function getMyOpportunities(req, res, next) {
  try {
    const opportunities = await Opportunity.find({ postedBy: req.user._id })
      .populate("requiredSkills.skill", "name category")
      .sort({ createdAt: -1 });
    res.json({ opportunities });
  } catch (err) {
    next(err);
  }
}

export async function getOpportunity(req, res, next) {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate(
      "requiredSkills.skill",
      "name category"
    );
    if (!opportunity) return res.status(404).json({ error: "Opportunity not found" });
    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
}
