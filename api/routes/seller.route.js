import express from "express";
import { verifyToken, requireSeller } from "../middleware/verifyToken.js";
import { getSellerOrders, getSellerSummary } from "../controllers/seller.controller.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// All seller routes must be protected
router.use(verifyToken, requireSeller);

// GET /api/seller/orders
router.get("/orders", cacheMiddleware("seller_orders", 120), getSellerOrders);

// GET /api/seller/summary
router.get("/summary", cacheMiddleware("seller_summary", 300), getSellerSummary);

export default router;