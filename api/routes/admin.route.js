import express from "express";
import { verifyToken, requireAdmin } from "../middleware/verifyToken.js";
import {
  getAdminDashboard,
  getAllUsers,
  getAllProducts,
  deleteUser,
  deleteProduct,
  getAllOrders,
  getAllTickets,
  resolveTicket,
} from "../controllers/admin.controller.js";

const router = express.Router();

/* ================= ADMIN DASHBOARD ================= */
router.get("/dashboard", verifyToken, requireAdmin, getAdminDashboard);

/* ================= USERS ================= */
router.get("/users", verifyToken, requireAdmin, getAllUsers);
router.delete("/users/:id", verifyToken, requireAdmin, deleteUser);

/* ================= PRODUCTS ================= */
router.get("/products", verifyToken, requireAdmin, getAllProducts);
router.delete("/products/:id", verifyToken, requireAdmin, deleteProduct);

/* ================= ORDERS ================= */
router.get("/orders", verifyToken, requireAdmin, getAllOrders);

/* ================= TICKETS ================= */
router.get("/tickets", verifyToken, requireAdmin, getAllTickets);
router.patch("/tickets/:id/resolve", verifyToken, requireAdmin, resolveTicket);

export default router;