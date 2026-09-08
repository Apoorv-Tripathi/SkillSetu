import Joi from "joi";

export const institutionSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  type: Joi.string().valid("engineering", "polytechnic", "university", "other").default("engineering"),
  city: Joi.string().allow("").max(100),
  state: Joi.string().allow("").max(100),
  branches: Joi.array().items(Joi.string()).default([]),
});

export const skillSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  category: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow("").max(500),
  expectedProficiency: Joi.number().min(0).max(5).default(3.5),
});

export const assessmentSchema = Joi.object({
  title: Joi.string().min(3).max(150).required(),
  description: Joi.string().allow("").max(1000),
  isActive: Joi.boolean().default(true),
  questions: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().min(3).required(),
        skill: Joi.string().required(),
        options: Joi.array()
          .items(Joi.object({ text: Joi.string().required(), score: Joi.number().min(0).max(5).required() }))
          .min(2)
          .required(),
      })
    )
    .min(1)
    .required(),
});
