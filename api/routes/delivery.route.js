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
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// Manager routes (get agents & unassigned orders)
router.get("/agents", verifyToken, cacheMiddleware("agents", 60), getDeliveryAgents);

// Agent routes (get assigned orders & update status)
router.get("/stats", verifyToken, cacheMiddleware("agent_stats", 60), getAgentStats);

export default router;
