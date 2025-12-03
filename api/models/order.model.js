// api/models/order.model.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, // snapshot of price at order time
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    billing: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address1: { type: String, required: true },
      address2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending_otp", "confirmed", "cancelled"],
      default: "pending_otp",
    },
    otp: { type: String }, // store as string
    otpExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
