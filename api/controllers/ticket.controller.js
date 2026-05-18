// api/controllers/ticket.controller.js
import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { clearCache } from "../utils/cache.js";

const clearTicketCaches = async () => {
  await Promise.all([
    clearCache("user_tickets"),
    clearCache("expert_tickets"),
    clearCache("ticket"),
  ]);
};

// Submit ticket (for buyers)
export const submitTicket = async (req, res, next) => {
  const { subject, type, description, urgency } = req.body;
  const attachmentFile = req.file;

  try {
    const cleanSubject = subject?.trim();
    const cleanDescription = description?.trim();
    const cleanType = type?.trim().toLowerCase();
    const cleanUrgency = urgency?.trim();

    if (!cleanSubject || !cleanType || !cleanDescription) {
      return next(
        errorHandler(400, "Subject, type, and description required")
      );
    }

    const expertiseMap = {
      general: "General",
      technical: "Technical",
      billing: "Billing",
    };

    const expertise = expertiseMap[cleanType];
    if (!expertise) return next(errorHandler(400, "Invalid type"));

    const expert = await User.findOne({ role: "Expert", expertise });

    if (!expert) {
      return next(
        errorHandler(
          500,
          `No expert available for ${expertise}. Please create an Expert with this expertise.`
        )
      );
    }

    const ticket = new Ticket({
      requester: req.user.username,
      subject: cleanSubject,
      type: cleanType,
      description: cleanDescription,
      urgency: cleanUrgency || "Normal (24h)",
      expert_id: expert._id,
      attachment: attachmentFile?.path || null,
    });

    await ticket.save();
    await clearTicketCaches();

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

    const assignedExpertId =
      ticket.expert_id?._id?.toString?.() || ticket.expert_id?.toString?.();
    const isAdmin = req.user.role === "admin";
    const isRequester = ticket.requester === req.user.username;
    const isAssignedExpert =
      req.user.role === "expert" && assignedExpertId === req.user.id;

    if (!isAdmin && !isRequester && !isAssignedExpert) {
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
    const cleanResolution = resolution?.trim();
    if (!cleanResolution) {
      return next(errorHandler(400, "Resolution required"));
    }

    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, expert_id: req.user.id },
      { resolution: cleanResolution, status: "Resolved", resolved_at: new Date() },
      { new: true }
    );

    if (!ticket) {
      return next(
        errorHandler(404, "Ticket not found or not assigned to this expert")
      );
    }

    await clearTicketCaches();
    res.json({ success: true, message: "Resolved", ticket });
  } catch (err) {
    next(err);
  }
};
