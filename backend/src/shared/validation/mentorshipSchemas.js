import Joi from "joi";

export const createMentorshipRequestSchema = Joi.object({
  mentor: Joi.string().required(),
  message: Joi.string().min(5).max(500).required(),
});

export const respondMentorshipRequestSchema = Joi.object({
  status: Joi.string().valid("accepted", "declined").required(),
});
