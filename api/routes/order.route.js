// api/routes/order.route.js
import express from "express";
import { verifyToken, requireBuyer, requireManager, requireAgent } from "../middleware/verifyToken.js";
import { sendOrderOtp, verifyOrderOtp, assignAgent, getAgentOrders, agentUpdateStatus, getUnassignedOrders } from "../controllers/order.controller.js";

const router = express.Router();

// Buyer endpoints
router.post("/send-otp", verifyToken, requireBuyer, sendOrderOtp);
router.post("/verify-otp", verifyToken, requireBuyer, verifyOrderOtp);

// Manager endpoint: assign an agent to an order
router.post("/assign", verifyToken, requireManager, assignAgent);

// Manager: list unassigned confirmed orders
router.get("/manager/orders", verifyToken, requireManager, getUnassignedOrders);

// Agent endpoints: list assigned orders, update status
router.get("/agent", verifyToken, requireAgent, getAgentOrders);
router.patch("/:id/status", verifyToken, requireAgent, agentUpdateStatus);

export default router;
