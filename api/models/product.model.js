import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number }, // Optional
  category: { type: String, default: "General" },
  image: { type: String }, // Path like /images/... from backend
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  quantity: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  sold_at: { type: Date },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
