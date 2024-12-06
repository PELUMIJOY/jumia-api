const express = require("express");
const {
  getItems,
  createItem,
  getItem,
  updateItem,
  deleteItem,
} = require("../Controller/itemController.js");
const validate = require("../middleware/validator.js");
const {
  createItemSchema,
  updateItemSchema,
} = require("../validations/itemsValidation.js");

const router = express.Router();

router.get("/", getItems);
router.get("/:id", getItem);
router.post("/", validate(createItemSchema), createItem);
router.put("/:id", validate(updateItemSchema), updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
