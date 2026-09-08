import Joi from "joi";

export const createOpportunitySchema = Joi.object({
  title: Joi.string().min(3).max(150).required(),
  type: Joi.string()
    .valid(
      "internship",
      "job",
      "live_project",
      "apprenticeship",
      "training_program",
      "certification_course",
      "workshop"
    )
    .default("internship"),
  description: Joi.string().min(10).required(),
  location: Joi.string().allow("").max(150),
  isRemote: Joi.boolean().default(false),
  stipend: Joi.string().allow("").max(100).default("Unpaid / Performance-based"),
  duration: Joi.string().allow("").max(100).default("3 Months"),
  eligibility: Joi.object({
    minGpa: Joi.number().min(0).max(10).default(0),
    eligibleBranches: Joi.array().items(Joi.string()).default([]),
    graduationYears: Joi.array().items(Joi.number()).default([]),
  }).default(),
  requiredSkills: Joi.array()
    .items(
      Joi.object({
        skill: Joi.string().required(),
        minProficiency: Joi.number().min(1).max(5).required(),
      })
    )
    .min(1)
    .required(),
});
