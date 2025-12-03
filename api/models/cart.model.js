// api/models/cart.model.js
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    // IMPORTANT: use user_id to match existing MongoDB index user_id_1
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart per user
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
