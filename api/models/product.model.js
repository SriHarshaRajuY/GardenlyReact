// server/models/product.model.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, default: "General" },
  image: { type: String },
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  quantity: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  soldAt: { type: Date },
});

// Indexes for optimization
productSchema.index({ category: 1, createdAt: -1 });
// Weighted text index for superior search experience (Solr-like)
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