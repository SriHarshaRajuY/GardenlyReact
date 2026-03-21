// api/models/order.model.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Each item now tracks seller & revenue split
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        // which seller sold this product
        sellerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        quantity: { type: Number, required: true, min: 1 },

        // snapshot price at order time
        price: { type: Number, required: true },

        // Revenue distribution
        adminCommission: {
          type: Number,
          required: true,
        },

        sellerEarning: {
          type: Number,
          required: true,
        },
      },
    ],

    // what customer paid
    totalAmount: {
      type: Number,
      required: true,
    },

    // what Gardenly earned from this order
    totalAdminCommission: {
      type: Number,
      default: 0,
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

    otp: { type: String },
    otpExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);