import Joi from "joi";

export const createCategorySchema = Joi.object({
  title: Joi.string().min(3).max(30).required().messages({
    "string.base": '"Title" must be a string',
    "string.empty": '"Title" cannot be empty',
    "string.min": '"Title" should have at least 3 characters',
    "string.max": '"Title" should have at most 50 characters',
    "any.required": '"Title" is required',
  }),
  description: Joi.string().max(100).optional(),
  subcategories: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
      })
    )
    .optional(),
});

export const updateCategorySchema = Joi.object({
  title: Joi.string().min(3).max(30).optional(),
  description: Joi.string().max(100).optional(),
  subcategories: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
      })
    )
    .optional(),
});
