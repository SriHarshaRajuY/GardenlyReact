import express from "express";
import {
  verifyToken,
  requireBuyer,
  requireSeller,
} from "../middleware/verifyToken.js";
import {
  createRequest,
  getBuyerRequests,
  getAllOpenRequests,
  submitProposal,
  acceptProposal,
} from "../controllers/customRequest.controller.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// Buyer routes
router.post("/", verifyToken, requireBuyer, createRequest);
router.get(
  "/my-requests",
  verifyToken,
  requireBuyer,
  cacheMiddleware("custom_requests", 300),
  getBuyerRequests
);
router.put(
  "/:id/proposals/:proposalId/accept",
  verifyToken,
  requireBuyer,
  acceptProposal
);

// Seller routes
router.get(
  "/open",
  verifyToken,
  requireSeller,
  cacheMiddleware("open_requests", 300),
  getAllOpenRequests
);
router.post("/:id/proposals", verifyToken, requireSeller, submitProposal);

export default router;
