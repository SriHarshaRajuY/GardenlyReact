// api/models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["Buyer", "Seller", "Admin", "Expert"] },
    mobile: { type: String, required: true, unique: true },
    expertise: { type: String, default: "General" }, // For experts: 'General', 'Technical', 'Billing'
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);