import Joi from "joi";
import { PHASE3_REGISTERABLE_ROLES, HIRING_ROLES } from "../constants/roles.js";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email({ tlds: false }).required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid(...PHASE3_REGISTERABLE_ROLES).required(),
  institutionName: Joi.string().trim().max(150).allow("", null).optional(),
  companyName: Joi.string().trim().max(150).allow("", null).when("role", {
    is: Joi.valid(...HIRING_ROLES),
    then: Joi.string().trim().min(2).max(150).required(),
    otherwise: Joi.string().allow("", null).optional(),
  }),
  bio: Joi.string().trim().max(500).allow("", null).optional(),
  department: Joi.string().trim().max(150).allow("", null).optional(),
}).unknown(true);

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required(),
  password: Joi.string().required(),
});
