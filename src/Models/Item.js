import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  description: { type: String, default: "" },
  imageUrl: { type: String, required: true },
  stock: { type: Number, default: 0 },
});

export default mongoose.model("Item", ItemSchema);
