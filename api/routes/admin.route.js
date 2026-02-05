// api/routes/admin.route.js
import express from "express";
import { verifyToken, requireAdmin } from "../middleware/verifyToken.js";
import { getAdminDashboard } from "../controllers/admin.controller.js";

const router = express.Router();

// GET /api/admin/dashboard
router.get("/dashboard", verifyToken, requireAdmin, getAdminDashboard);

export default router;
