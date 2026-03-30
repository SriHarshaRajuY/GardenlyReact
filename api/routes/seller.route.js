import express from "express";
import { verifyToken, requireSeller } from "../middleware/verifyToken.js";
import {
  getSellerOrders,
  getSellerSummary,
  getSellerProducts,
  getSellerCreateProduct,
  updateOrderShippingStatus,
  updateSellerProduct, // Added this to fix the ReferenceError
  markOrderAsShipped,
  getSellerEarnings
} from "../controllers/seller.controller.js";

const router = express.Router();

// All seller routes must be protected
router.use(verifyToken, requireSeller);

// GET /api/seller/orders
router.get("/orders", getSellerOrders);

// GET /api/seller/summary
router.get("/summary", getSellerSummary);

/**
 * @swagger
 * /api/seller/orders/{orderId}/ship:
 *   put:
 *     summary: Mark an order as shipped (seller only)
 *     description: Allows a seller to mark one of their order items as shipped. Updates order status if all items are shipped. Seller must be the owner of the product(s) in the order.
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to mark as shipped (must contain at least one item from this seller)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trackingNumber:
 *                 type: string
 *                 example: "SP123456789"
 *                 description: Optional carrier tracking number
 *               carrier:
 *                 type: string
 *                 example: "Delhivery"
 *                 description: Optional shipping carrier name
 *               shippedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-20T14:30:00.000Z"
 *                 description: Optional explicit shipment timestamp (defaults to now)
 *               notes:
 *                 type: string
 *                 example: "Left at security gate"
 *                 description: Optional seller note for buyer
 *             required:
 *               - trackingNumber
 *     responses:
 *       200:
 *         description: Order/item successfully marked as shipped
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Order marked as shipped" }
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/ServerError'
 *         description: Invalid request (e.g. not seller's order, already shipped)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put("/orders/:orderId/ship", verifyToken, updateOrderShippingStatus);

/**
 * @swagger
 * /api/seller/products:
 *   get:
 *     summary: Get list of products created by the current seller
 *     description: Returns the authenticated seller's own products with basic stats and optional filtering
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, outofstock]
 *         description: Filter by product status
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Show only products with low stock (quantity ≤ 5)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, price-asc, price-desc, sold-desc]
 *         description: Sort products
 *     responses:
 *       200:
 *         description: Seller's products list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     pages: { type: integer }
 *                 count: { type: integer }
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - not a seller
 */
router.get("/products", getSellerProducts);

/**
 * @swagger
 * /api/seller/products:
 *   post:
 *     summary: Create a new product (seller only)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category, quantity]
 *             properties:
 *               name: { type: string, example: "Neem Tree Sapling" }
 *               description: { type: string }
 *               price: { type: number, example: 299 }
 *               category: { type: string, example: "Trees" }
 *               quantity: { type: integer, example: 50 }
 *               image: { type: string, example: "https://cdn..." }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 product: { $ref: '#/components/schemas/Product' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       403: { description: Not authorized (not seller) }
 */
router.post("/products", getSellerCreateProduct);

/**
 * @swagger
 * /api/seller/products/{id}:
 *   put:
 *     summary: Update one of your own products
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               quantity: { type: integer }
 *               isActive: { type: boolean }
 *               description: { type: string }
 *               image: { type: string }
 *     responses:
 *       200:
 *         description: Product updated
 *       403:
 *         description: Not your product or not seller
 *       404:
 *         description: Product not found
 */
router.put("/products/:id", updateSellerProduct);

/**
 * @swagger
 * /api/seller/orders/{id}/ship:
 *   put:
 *     summary: Mark an order as shipped (seller only)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trackingNumber: { type: string }
 *               courier: { type: string, example: "DTDC" }
 *               shippedAt: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Order shipping status updated
 *       403:
 *         description: Order does not contain your products
 *       404:
 *         description: Order not found
 */
router.put("/orders/:id/ship", markOrderAsShipped);

/**
 * @swagger
 * /api/seller/earnings:
 *   get:
 *     summary: Get earnings summary and breakdown
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, month, year]
 *         default: all
 *     responses:
 *       200:
 *         description: Earnings data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 earnings:
 *                   type: object
 *                   properties:
 *                     lifetime: { type: number }
 *                     thisMonth: { type: number }
 *                     thisYear: { type: number }
 *                     pendingPayout: { type: number }
 *                     lastPayout: { type: object }
 */
router.get("/earnings", getSellerEarnings);

export default router;