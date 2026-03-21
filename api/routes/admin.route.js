import express from "express";
import { verifyToken, requireAdmin } from "../middleware/verifyToken.js";
import {
  getAdminDashboard,
  getAllUsers,
  getAllProducts,
  approveSeller,
  moderateProduct,
  getAllOrdersAdmin,
} from "../controllers/admin.controller.js";

const router = express.Router(); // ✅ MUST BE FIRST

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/* ================= SELLER APPROVAL ================= */
/**
 * @swagger
 * /api/admin/sellers/{id}/approve:
 *   put:
 *     summary: Approve / reject seller
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put("/sellers/:id/approve", verifyToken, requireAdmin, approveSeller);

/* ================= PRODUCT MODERATION ================= */
/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Moderate product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put("/products/:id", verifyToken, requireAdmin, moderateProduct);

/* ================= ORDERS ================= */
/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/orders", verifyToken, requireAdmin, getAllOrdersAdmin);

/* ================= DASHBOARD ================= */
/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/dashboard", verifyToken, requireAdmin, getAdminDashboard);

/* ================= USERS ================= */
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/users", verifyToken, requireAdmin, getAllUsers);

/* ================= PRODUCTS ================= */
/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/products", verifyToken, requireAdmin, getAllProducts);

export default router;