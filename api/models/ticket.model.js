// api/models/ticket.model.js
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    requester: { type: String, required: true, trim: true }, // buyer username
    subject: { type: String, required: true, trim: true },
    // 'general', 'technical', 'billing'
    type: {
      type: String,
      enum: ["general", "technical", "billing"],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    urgency: {
      type: String,
      enum: ["Normal (24h)", "High (12h)"],
      default: "Normal (24h)",
    },
    status: { type: String, enum: ["Open", "Resolved"], default: "Open" },
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
