// models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["Buyer", "Seller", "Admin", "Expert"], // Based on old project roles
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;