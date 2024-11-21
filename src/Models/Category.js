import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    subcategories: [
      {
        title: { type: String, required: true },
        description: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
