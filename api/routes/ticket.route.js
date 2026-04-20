// api/routes/ticket.route.js
import express from "express";
import {
  submitTicket,
  getUserTickets,
  getExpertTickets,
  getTicket,
  resolveTicket,
} from "../controllers/ticket.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import upload from "../upload.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// Buyer: Submit ticket
router.post(
  "/submit",
  verifyToken,
  upload.single("attachment"),
  submitTicket
);

// Buyer: Get own tickets
router.get("/user", verifyToken, cacheMiddleware("user_tickets", 60), getUserTickets);

// Expert: Get assigned tickets
router.get("/expert", verifyToken, cacheMiddleware("expert_tickets", 60), getExpertTickets);

// Buyer/Expert/Admin: Get single ticket
router.get("/:id", verifyToken, cacheMiddleware("ticket", 60), getTicket);

// Expert: Resolve ticket
router.post("/:id/resolve", verifyToken, resolveTicket);

export default router;
