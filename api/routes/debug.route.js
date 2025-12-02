import express from "express";
import { sendTestEmail, seedUsers } from "../controllers/debug.controller.js";

const router = express.Router();

// GET /api/debug/send-test-email?to=you@example.com
router.get("/send-test-email", sendTestEmail);

// GET /api/debug/seed-users  (dev only) - creates manager1 and agent1 accounts
router.get("/seed-users", seedUsers);

export default router;
