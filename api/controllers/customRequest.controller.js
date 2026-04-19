import CustomRequest from "../models/customRequest.model.js";
import { errorHandler } from "../utils/error.js";

// Buyer: Create a new custom request
export const createRequest = async (req, res, next) => {
  try {
    const { title, description, budget } = req.body;
    if (!title || !description) {
      return next(errorHandler(400, "Title and description are required"));
    }

    const newReq = new CustomRequest({
      buyer_id: req.user.id,
      title,
      description,
      budget: budget || 0,
    });

    await newReq.save();
    res.status(201).json({ success: true, request: newReq });
  } catch (err) {
    next(err);
  }
};

// Buyer: Get their own requests
export const getBuyerRequests = async (req, res, next) => {
  try {
    const requests = await CustomRequest.find({ buyer_id: req.user.id })
      .populate("proposals.seller_id", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    next(err);
  }
};

// Seller: Get all open requests from any buyer
export const getAllOpenRequests = async (req, res, next) => {
  try {
    const requests = await CustomRequest.find({ status: "Open" })
      .populate("buyer_id", "username")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    next(err);
  }
};

// Seller: Submit a proposal
export const submitProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price, message } = req.body;

    const request = await CustomRequest.findById(id);
    if (!request) return next(errorHandler(404, "Request not found"));
    if (request.status !== "Open") return next(errorHandler(400, "Request is not open for proposals"));

    // Check if already proposed
    const existing = request.proposals.find((p) => p.seller_id.toString() === req.user.id);
    if (existing) return next(errorHandler(400, "You have already submitted a proposal"));

    request.proposals.push({
      seller_id: req.user.id,
      price,
      message,
    });

    await request.save();
    res.status(200).json({ success: true, request });
  } catch (err) {
    next(err);
  }
};

// Buyer: Accept a proposal
export const acceptProposal = async (req, res, next) => {
  try {
    const { id, proposalId } = req.params;
    const request = await CustomRequest.findById(id);

    if (!request) return next(errorHandler(404, "Request not found"));
    if (request.buyer_id.toString() !== req.user.id) return next(errorHandler(403, "Not authorized"));

    const proposal = request.proposals.id(proposalId);
    if (!proposal) return next(errorHandler(404, "Proposal not found"));

    // Accept this one, reject others
    request.proposals.forEach((p) => {
      p.status = p._id.toString() === proposalId ? "Accepted" : "Rejected";
    });
    
    request.status = "In Progress";
    await request.save();

    res.status(200).json({ success: true, request });
  } catch (err) {
    next(err);
  }
};
