import CustomRequest from "../models/customRequest.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { sendMail } from "../utils/mailer.js";
import { clearCache } from "../utils/cache.js";

const clearCustomRequestCaches = async () => {
  await Promise.all([
    clearCache("custom_requests"),
    clearCache("open_requests"),
    clearCache("admin_custom_requests"),
  ]);
};

const parseNonNegativeNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const parsePositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

// Buyer: Create a new custom request
export const createRequest = async (req, res, next) => {
  try {
    const title = req.body.title?.trim();
    const description = req.body.description?.trim();
    const budget = parseNonNegativeNumber(req.body.budget);

    if (!title || !description) {
      return next(errorHandler(400, "Title and description are required"));
    }

    if (budget === null) {
      return next(errorHandler(400, "Budget must be a non-negative number"));
    }

    const newReq = new CustomRequest({
      buyer_id: req.user.id,
      title,
      description,
      budget,
    });

    await newReq.save();
    await clearCustomRequestCaches();
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
    const price = parsePositiveNumber(req.body.price);
    const message = req.body.message?.trim();

    if (price === null || !message) {
      return next(errorHandler(400, "Valid price and message are required"));
    }

    const request = await CustomRequest.findById(id);
    if (!request) return next(errorHandler(404, "Request not found"));
    if (request.status !== "Open") {
      return next(errorHandler(400, "Request is not open for proposals"));
    }

    const existing = request.proposals.find(
      (proposal) => proposal.seller_id.toString() === req.user.id
    );
    if (existing) {
      return next(errorHandler(400, "You have already submitted a proposal"));
    }

    request.proposals.push({
      seller_id: req.user.id,
      price,
      message,
    });

    await request.save();
    await clearCustomRequestCaches();
    res.status(200).json({ success: true, request });
  } catch (err) {
    next(err);
  }
};

// Buyer: Accept a proposal
export const acceptProposal = async (req, res, next) => {
  try {
    const { id, proposalId } = req.params;
    const request = await CustomRequest.findById(id).populate(
      "buyer_id",
      "username email"
    );

    if (!request) return next(errorHandler(404, "Request not found"));
    if (request.buyer_id._id.toString() !== req.user.id) {
      return next(errorHandler(403, "Not authorized"));
    }
    if (request.status !== "Open") {
      return next(errorHandler(400, "This request has already been confirmed"));
    }

    const proposal = request.proposals.id(proposalId);
    if (!proposal) return next(errorHandler(404, "Proposal not found"));
    if (proposal.status !== "Pending") {
      return next(errorHandler(400, "Proposal has already been handled"));
    }

    const seller = await User.findById(proposal.seller_id);

    request.proposals.forEach((currentProposal) => {
      currentProposal.status =
        currentProposal._id.toString() === proposalId ? "Accepted" : "Rejected";
    });
    request.status = "Confirmed";

    await request.save();
    await clearCustomRequestCaches();

    let emailWarning = null;
    if (seller && request.buyer_id.email && seller.email) {
      try {
        const buyerMail = `Hello ${request.buyer_id.username},

You have accepted the proposal from ${seller.username} for your custom request "${request.title}".

Seller Contact: ${seller.email}
Price: Rs. ${proposal.price}

Please coordinate with the seller to complete the request.`;

        const sellerMail = `Hello ${seller.username},

Your proposal for the custom request "${request.title}" has been accepted by ${request.buyer_id.username}.

Buyer Contact: ${request.buyer_id.email}
Price: Rs. ${proposal.price}

Please get in touch with the buyer to finalize the details.`;

        await sendMail(
          request.buyer_id.email,
          "Proposal Accepted - Contact Details",
          buyerMail
        );
        await sendMail(
          seller.email,
          "Proposal Accepted - Contact Details",
          sellerMail
        );
      } catch (mailErr) {
        console.error("Custom request acceptance email failed:", mailErr);
        emailWarning = "Proposal accepted, but email notification failed.";
      }
    }

    res.status(200).json({ success: true, request, emailWarning });
  } catch (err) {
    next(err);
  }
};
