import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["Plants", "Seeds", "Pots", "Tips", "General"], 
      default: "General" 
    },
    image: { type: String },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Community", communitySchema);
