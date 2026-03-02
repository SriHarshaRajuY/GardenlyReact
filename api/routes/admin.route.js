import express from "express";
import { verifyToken, requireAdmin } from "../middleware/verifyToken.js";
import {
  getAdminDashboard,
  getAllUsers,
  getAllProducts,
} from "../controllers/admin.controller.js";

const router = express.Router();

/* ================= ADMIN DASHBOARD ================= */
router.get("/dashboard", verifyToken, requireAdmin, getAdminDashboard);

/* ================= USERS ================= */
router.get("/users", verifyToken, requireAdmin, getAllUsers);

/* ================= PRODUCTS ================= */
router.get("/products", verifyToken, requireAdmin, getAllProducts);

export default router;