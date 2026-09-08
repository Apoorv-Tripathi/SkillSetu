import Joi from "joi";

export const createPortfolioItemSchema = Joi.object({
  type: Joi.string()
    .valid(
      "certificate",
      "project",
      "document",
      "resume",
      "internship_report",
      "achievement",
      "academic_record"
    )
    .required(),
  title: Joi.string().min(3).max(150).required(),
  description: Joi.string().allow("").max(1000),
  issuer: Joi.string().allow("").max(150),
  credentialId: Joi.string().allow("").max(100),
  skillsDemonstrated: Joi.array().items(Joi.string()).default([]),
  link: Joi.string().uri().allow(""),
  dateIssued: Joi.date().optional(),
});

export const reviewPortfolioItemSchema = Joi.object({
  verificationStatus: Joi.string().valid("verified", "rejected", "unverified").required(),
  reviewNote: Joi.string().allow("").max(500),
});
