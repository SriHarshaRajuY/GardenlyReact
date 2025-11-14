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

export default mongoose.model("Product", productSchema);