// server/models/product.model.js
import mongoose from "mongoose";

export const PRODUCT_CATEGORIES = ["Plants", "Seeds", "Pots"];

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: PRODUCT_CATEGORIES, required: true },
  image: { type: String },
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  quantity: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: "Quantity must be a whole number",
    },
  },
  sold: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  soldAt: { type: Date },
});

// Indexes for optimization
productSchema.index({ category: 1, createdAt: -1 });
// Weighted text index for catalog search relevance.
productSchema.index(
  { 
    name: "text", 
    category: "text", 
    description: "text" 
  },
  {
    weights: {
      name: 10,
      category: 5,
      description: 1
    },
    name: "TextSearchIndex"
  }
);
productSchema.index({ seller_id: 1 });

export default mongoose.model("Product", productSchema);
