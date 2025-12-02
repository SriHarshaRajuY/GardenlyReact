// server/routes/user.route.js
import express from "express";
import { test, getAgents } from "../controllers/user.controller.js";
import { verifyToken, requireManager } from "../middleware/verifyToken.js";

const router = express.Router();

router.get('/test', test);

// Managers can list delivery agents
router.get('/agents', verifyToken, requireManager, getAgents);

export default router;