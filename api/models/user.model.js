// api/models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["Buyer", "Seller", "Admin", "Expert", "Manager", "Agent"],
    },
    mobile: { type: String, required: true, unique: true },
    expertise: {
      type: String,
      enum: ["General", "Technical", "Billing"],
      default: "General",
    },

    // For delivery agents
    isAvailable: { type: Boolean, default: false },
    // === FOR PASSWORD RESET OTP ===
    resetOtp: { type: String },
    resetOtpExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);