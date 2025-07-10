const Joi = require("joi");

const createItemSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.base": '"Name" must be a string',
    "string.empty": '"Name" cannot be empty',
    "string.min": '"Name" should have at least 3 characters',
    "string.max": '"Name" should have at most 50 characters',
    "any.required": '"Name" is required',
  }),
  description: Joi.string().max(1000).optional(),
  price: Joi.number().positive().required(),
  category: Joi.string().required().messages({
    "any.required": '"Category" is required',
  }),
  stock: Joi.number().integer().min(0).optional(),
  imageUrl: Joi.string().required(),
});

const updateItemSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  description: Joi.string().max(1000).optional(),
  price: Joi.number().positive().optional(),
  category: Joi.string().optional().messages({
    "any.required": '"Category" is required',
  }),
  stock: Joi.number().integer().min(0).optional(),
  imageUrl: Joi.string().optional(),
});

module.exports = {
  createItemSchema,
  updateItemSchema,
};

