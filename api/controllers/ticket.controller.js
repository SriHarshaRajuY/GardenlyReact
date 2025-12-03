// api/controllers/ticket.controller.js
import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Submit ticket (for buyers)
export const submitTicket = async (req, res, next) => {
  const { subject, type, description } = req.body;
  const attachmentFile = req.file;

  try {
    if (!subject || !type || !description) {
      return next(
        errorHandler(400, "Subject, type, and description required")
      );
    }

    // Normalize type (from frontend select)
    const normalizedType = type.toLowerCase(); // 'general' | 'technical' | 'billing'

    // Map ticket.type → expert.expertise in DB
    const expertiseMap = {
      general: "General",
      technical: "Technical",
      billing: "Billing",
    };

    const expertise = expertiseMap[normalizedType];
    if (!expertise) return next(errorHandler(400, "Invalid type"));

    // Find an expert with matching expertise
    const expert = await User.findOne({ role: "Expert", expertise });

    if (!expert) {
      return next(
        errorHandler(
          500,
          `No expert available for ${expertise}. Please create an Expert with this expertise.`
        )
      );
    }

    // Handle attachment (if any) → store as base64 data URL
    let attachment = null;
    if (attachmentFile) {
      const buffer = attachmentFile.buffer;
      attachment = `data:${attachmentFile.mimetype};base64,${buffer.toString(
        "base64"
      )}`;
    }

    const ticket = new Ticket({
      requester: req.user.username, // from JWT
      subject,
      type: normalizedType,
      description,
      expert_id: expert._id,
      attachment,
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      message: `Ticket submitted and assigned to ${expert.username} (${expert.expertise})`,
      ticketId: ticket._id,
    });
  } catch (err) {
    next(err);
  }
};

// Get user's tickets (for buyers)
export const getUserTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ requester: req.user.username })
      .populate("expert_id", "username expertise")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

// Get assigned tickets (for experts)
export const getExpertTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ expert_id: req.user.id })
      .populate("expert_id", "username expertise")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

// Get single ticket
export const getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "expert_id",
      "username expertise"
    );
    if (!ticket) return next(errorHandler(404, "Ticket not found"));

    // Permission: admin, expert, or the buyer who requested
    if (
      req.user.role !== "admin" &&
      req.user.role !== "expert" &&
      ticket.requester !== req.user.username
    ) {
      return next(errorHandler(403, "Access denied"));
    }

    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

// Resolve ticket (for experts)
export const resolveTicket = async (req, res, next) => {
  const { resolution } = req.body;

  try {
    if (!resolution) return next(errorHandler(400, "Resolution required"));

    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, expert_id: req.user.id },
      { resolution, status: "Resolved", resolved_at: new Date() },
      { new: true }
    );

    if (!ticket) {
      return next(
        errorHandler(404, "Ticket not found or not assigned to this expert")
      );
    }

    res.json({ success: true, message: "Resolved", ticket });
  } catch (err) {
    next(err);
  }
};
