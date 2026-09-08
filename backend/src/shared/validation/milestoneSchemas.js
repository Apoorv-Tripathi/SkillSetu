import Joi from "joi";

export const createMilestoneSchema = Joi.object({
  application: Joi.string().required(),
  mentor: Joi.string().required(),
  title: Joi.string().min(3).max(150).required(),
  description: Joi.string().allow("").max(1000),
  dueDate: Joi.date().optional(),
});

export const submitEvaluationSchema = Joi.object({
  skillEvaluations: Joi.array()
    .items(
      Joi.object({
        skill: Joi.string().required(),
        score: Joi.number().min(0).max(5).required(),
        comment: Joi.string().allow("").max(500),
      })
    )
    .min(1)
    .required(),
  overallFeedback: Joi.string().allow("").max(1000),
});
