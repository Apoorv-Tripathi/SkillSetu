import Joi from "joi";
import { PHASE3_REGISTERABLE_ROLES, HIRING_ROLES } from "../constants/roles.js";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email({ tlds: false }).required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid(...PHASE3_REGISTERABLE_ROLES).required(),
  institutionName: Joi.string().max(150).optional(),
  companyName: Joi.string().max(150).when("role", {
    is: Joi.valid(...HIRING_ROLES),
    then: Joi.required(),
  }),
  bio: Joi.string().max(500).when("role", {
    is: "mentor",
    then: Joi.required(),
  }),
  department: Joi.string().max(150).when("role", {
    is: "academician",
    then: Joi.required(),
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required(),
  password: Joi.string().required(),
});
