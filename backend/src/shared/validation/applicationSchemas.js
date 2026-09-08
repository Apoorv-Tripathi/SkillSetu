import Joi from "joi";

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid("shortlisted", "interview", "offer", "rejected").required(),
  note: Joi.string().allow("").max(500),
  mentor: Joi.string().optional(), // ObjectId of a mentor, typically set at interview/offer stage
});

export const addFeedbackSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  notes: Joi.string().min(3).max(1000).required(),
});
