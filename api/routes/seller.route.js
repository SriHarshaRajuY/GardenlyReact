import express from "express";
import { verifyToken, requireSeller } from "../middleware/verifyToken.js";
import { getSellerOrders, getSellerSummary } from "../controllers/seller.controller.js";

const router = express.Router();

// All seller routes must be protected
router.use(verifyToken, requireSeller);

// GET /api/seller/orders
router.get("/orders", getSellerOrders);

// GET /api/seller/summary
router.get("/summary", getSellerSummary);

export default router;