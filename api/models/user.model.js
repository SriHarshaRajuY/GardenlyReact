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
      enum: ["Buyer", "Seller", "Admin", "Expert"],
    },
    mobile: { type: String, required: true, unique: true },
    expertise: {
      type: String,
      enum: ["General", "Technical", "Billing"],
      default: "General",
    },

    // === FOR EMAIL VERIFICATION ===
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOtp: { type: String },
    emailVerificationOtpExpiresAt: { type: Date },

    // === FOR 2FA ===
    twoFactorOtp: { type: String },
    twoFactorOtpExpiresAt: { type: Date },

    // === FOR PASSWORD RESET OTP ===
    resetOtp: { type: String },
    resetOtpExpiresAt: { type: Date },
    joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],

  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);