// api/models/ticket.model.js
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    requester: { type: String, required: true }, // buyer username
    subject: { type: String, required: true },
    // 'general', 'technical', 'billing'
    type: { type: String, required: true },
    description: { type: String, required: true },
    urgency: { type: String, default: "Normal (24h)" },
    status: { type: String, default: "Open" }, // 'Open' | 'Resolved'
    expert_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attachment: { type: String }, // base64 data URL
    resolution: { type: String },
    resolved_at: { type: Date },
  },
  { timestamps: true }
);

ticketSchema.index({ status: 1 });
ticketSchema.index({ requester: 1 });
ticketSchema.index({ expert_id: 1 });

export default mongoose.model("Ticket", ticketSchema);
