import Joi from "joi";

export const submitAssessmentSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionIndex: Joi.number().integer().min(0).required(),
        selectedOptionIndex: Joi.number().integer().min(0).required(),
      })
    )
    .min(1)
    .required(),
});
