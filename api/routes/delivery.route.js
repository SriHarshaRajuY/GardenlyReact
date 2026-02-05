// api/routes/delivery.route.js
import express from "express";
import {
  getDeliveryAgents,
  getUnassignedOrders,
  assignOrderToAgent,
  getAgentDeliveries,
  updateDeliveryStatus,
  getAgentStats,
} from "../controllers/delivery.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Manager routes (get agents & unassigned orders)
router.get("/agents", verifyToken, getDeliveryAgents);

// Agent routes (get assigned orders & update status)
router.get("/stats", verifyToken, getAgentStats);

export default router;
