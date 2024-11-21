import express from "express";
import {
  getItems,
  createItem,
  getItem,
  updateItem,
  deleteItem,
} from "../Controller/itemController.js";
import validate from "../middleware/validator.js";
import {
  createItemSchema,
  updateItemSchema,
} from "../validations/itemsValidation.js";

const router = express.Router();

router.get("/", getItems);
router.get("/:id", getItem);
router.post("/", validate(createItemSchema), createItem);
router.put("/:id", validate(updateItemSchema), updateItem);
router.delete("/:id", deleteItem);

export default router;
