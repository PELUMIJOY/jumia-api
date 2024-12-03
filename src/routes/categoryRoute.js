import express from "express";
import {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../Controller/categoryController.js";
import validate from "../middleware/validator.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/categoryValidation.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", validate(createCategorySchema), createCategory);
router.put("/:id", validate(updateCategorySchema), updateCategory);
router.delete("/:id", deleteCategory);

export default router;
