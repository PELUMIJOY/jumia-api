const express = require("express");
const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../Controller/categoryController.js");
const validate = require("../middleware/validator.js");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validations/categoryValidation.js");

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", validate(createCategorySchema), createCategory);
router.put("/:id", validate(updateCategorySchema), updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
