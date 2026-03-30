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
 *   description: Admin management endpoints (seller approval, product moderation, order & user management)
 */

/* ================= DASHBOARD ================= */
/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard stats
 *     description: Retrieve comprehensive dashboard statistics including user counts, product counts, order statistics, ticket metrics, and revenue data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total: { type: integer, example: 150 }
 *                         buyers: { type: integer, example: 120 }
 *                         sellers: { type: integer, example: 20 }
 *                         experts: { type: integer, example: 8 }
 *                         admins: { type: integer, example: 2 }
 *                     products:
 *                       type: object
 *                       properties:
 *                         total: { type: integer, example: 500 }
 *                     orders:
 *                       type: object
 *                       properties:
 *                         total: { type: integer, example: 300 }
 *                         pending: { type: integer, example: 50 }
 *                         confirmed: { type: integer, example: 200 }
 *                         cancelled: { type: integer, example: 10 }
 *                         revenue: { type: number, example: 50000 }
 *                     tickets:
 *                       type: object
 *                       properties:
 *                         total: { type: integer, example: 45 }
 *                         open: { type: integer, example: 15 }
 *                         resolved: { type: integer, example: 30 }
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       403:
 *         description: Forbidden - You do not have access (not an admin)
 *       500:
 *         description: Internal server error
 */
router.get("/dashboard", verifyToken, requireAdmin, getAdminDashboard);

/* ================= USERS ================= */
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve list of all users in the system with their details (passwords are excluded)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 150
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       403:
 *         description: Forbidden - You do not have access (not an admin)
 *       500:
 *         description: Internal server error
 */
router.get("/users", verifyToken, requireAdmin, getAllUsers);

/* ================= PRODUCTS ================= */
/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve all products with seller information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 500
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       403:
 *         description: Forbidden - You do not have access (not an admin)
 *       500:
 *         description: Internal server error
 */
router.get("/products", verifyToken, requireAdmin, getAllProducts);

/* ================= ORDERS ================= */
/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders with filters
 *     description: Retrieve all orders with pagination and filtering options (status, seller, buyer, date range)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination (default 1)
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of orders per page (default 20)
 *         schema:
 *           type: integer
 *           example: 20
 *       - name: status
 *         in: query
 *         description: Filter by order status
 *         schema:
 *           type: string
 *           enum: [pending_otp, confirmed, shipped, delivered, cancelled]
 *       - name: sellerId
 *         in: query
 *         description: Filter by seller ID
 *         schema:
 *           type: string
 *       - name: buyerId
 *         in: query
 *         description: Filter by buyer/user ID
 *         schema:
 *           type: string
 *       - name: fromDate
 *         in: query
 *         description: Filter orders from this date (ISO format)
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: toDate
 *         in: query
 *         description: Filter orders until this date (ISO format)
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 20 }
 *                     total: { type: integer, example: 300 }
 *                     pages: { type: integer, example: 15 }
 *                 count:
 *                   type: integer
 *                   example: 20
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       403:
 *         description: Forbidden - You do not have access (not an admin)
 *       500:
 *         description: Internal server error
 */
router.get("/orders", verifyToken, requireAdmin, getAllOrdersAdmin);

/* ================= SELLER APPROVAL ================= */
/**
 * @swagger
 * /api/admin/sellers/{id}/approve:
 *   put:
 *     summary: Approve, reject, or suspend seller
 *     description: Update seller approval status (approve, reject, or suspend). Rejection and suspension require a reason.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Seller user ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject, suspend]
 *                 description: Action to perform on seller account
 *                 example: approve
 *               reason:
 *                 type: string
 *                 description: Reason for rejection or suspension (required if action is not 'approve')
 *                 example: "Does not meet seller criteria"
 *           example:
 *             action: approve
 *             reason: null
 *     responses:
 *       200:
 *         description: Seller status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Seller approved successfully"
 *                 seller:
 *                   type: object
 *                   properties:
 *                     _id: { type: string }
 *                     name: { type: string }
 *                     email: { type: string }
 *                     role: { type: string }
 *                     isApproved: { type: boolean }
 *                     status: { type: string, enum: [active, rejected, suspended] }
 *                     approvalReason: { type: string }
 *                     approvedAt: { type: string, format: date-time, nullable: true }
 *       400:
 *         description: Invalid action or missing reason
 *       404:
 *         description: Seller not found
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       403:
 *         description: Forbidden - You do not have access (not an admin)
 *       500:
 *         description: Internal server error
 */
router.put("/sellers/:id/approve", verifyToken, requireAdmin, approveSeller);

/* ================= PRODUCT MODERATION ================= */
/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Moderate product (hide, show, delete, restore)
 *     description: Change product visibility or deletion status with optional admin notes
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [hide, show, delete, restore]
 *                 description: Moderation action
 *                 example: hide
 *               reason:
 *                 type: string
 *                 description: Optional reason for the action (will be stored as admin note)
 *                 example: "Product does not meet quality standards"
 *           example:
 *             action: hide
 *             reason: "Inappropriate content"
 *     responses:
 *       200:
 *         description: Product moderated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product hidden successfully"
 *                 product:
 *                   type: object
 *                   properties:
 *                     _id: { type: string }
 *                     name: { type: string }
 *                     isActive: { type: boolean }
 *                     isDeleted: { type: boolean }
 *                     adminNote: { type: string }
 *       400:
 *         description: Invalid action
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       403:
 *         description: Forbidden - You do not have access (not an admin)
 *       500:
 *         description: Internal server error
 */
router.put("/products/:id", verifyToken, requireAdmin, moderateProduct);

export default router;