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
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Buyer: Submit ticket
router.post("/submit", verifyToken, upload.single("attachment"), submitTicket);

// Buyer: Get own tickets
router.get("/user", verifyToken, getUserTickets);

// Expert: Get assigned tickets
router.get("/expert", verifyToken, getExpertTickets);

// Buyer/Expert: Get single ticket
router.get("/:id", verifyToken, getTicket);

// Expert: Resolve ticket
router.post("/:id/resolve", verifyToken, resolveTicket);

export default router;