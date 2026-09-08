import Joi from "joi";

export const createCollaborationActivitySchema = Joi.object({
  type: Joi.string()
    .valid(
      "faculty_internship",
      "industrial_training",
      "fdp",
      "consultancy",
      "guest_lecture",
      "research_partnership",
      "innovation_challenge",
      "workshop"
    )
    .required(),
  title: Joi.string().min(3).max(150).required(),
  description: Joi.string().min(10).max(2000).required(),
});

export const applyToActivitySchema = Joi.object({
  message: Joi.string().min(5).max(500).required(),
});

export const respondToActivityApplicantSchema = Joi.object({
  status: Joi.string().valid("accepted", "declined").required(),
});
