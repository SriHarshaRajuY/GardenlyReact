import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true },
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sold: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);