import mongoose from "mongoose";

const customRequestSchema = new mongoose.Schema(
  {
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Open", "Confirmed", "Completed", "Closed"],
      default: "Open",
    },
    proposals: [
      {
        seller_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        price: Number,
        message: String,
        status: {
          type: String,
          enum: ["Pending", "Accepted", "Rejected"],
          default: "Pending",
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

customRequestSchema.index({ buyer_id: 1 });
customRequestSchema.index({ status: 1 });

export default mongoose.model("CustomRequest", customRequestSchema);
