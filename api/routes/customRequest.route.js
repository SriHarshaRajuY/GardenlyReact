import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireSeller } from "../middleware/verifyToken.js"; // Assume this exists or we verify inside
import {
  createRequest,
  getBuyerRequests,
  getAllOpenRequests,
  submitProposal,
  acceptProposal,
} from "../controllers/customRequest.controller.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// Role check middleware inline if not exist
const isSeller = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Only sellers can perform this action" });
  }
};

// Buyer routes
router.post("/", verifyToken, createRequest);
router.get("/my-requests", verifyToken, cacheMiddleware("custom_requests", 300), getBuyerRequests);
router.put("/:id/proposals/:proposalId/accept", verifyToken, acceptProposal);

// Seller routes
router.get("/open", verifyToken, isSeller, cacheMiddleware("open_requests", 300), getAllOpenRequests);
router.post("/:id/proposals", verifyToken, isSeller, submitProposal);

export default router;
