// api/models/ticket.model.js
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    requester: { type: String, required: true }, // Username of the buyer
    subject: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'general', 'technical', 'billing'
    description: { type: String, required: true },
    status: { type: String, default: "Open" }, // 'Open', 'Resolved'
    expert_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attachment: { type: String }, // Base64 or URL for image
    resolution: { type: String },
    resolved_at: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);