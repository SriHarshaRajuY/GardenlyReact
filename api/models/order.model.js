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
      enum: ["pending_otp", "confirmed", "assigned", "picked_up", "delivered", "cancelled"],
      default: "pending_otp",
    },
    // Assigned delivery agent (User with role Agent)
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Manager who assigned the agent
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // History of assignments and status changes
    assignmentHistory: [
      {
        agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String },
        at: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    otp: { type: String }, // store as string
    otpExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
