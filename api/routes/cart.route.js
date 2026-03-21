// api/routes/cart.route.js
import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  checkout,
} from "../controllers/cart.controller.js";
import { verifyToken, requireBuyer } from "../middleware/verifyToken.js";

const router = express.Router();

// All cart routes require authenticated buyer
router.use(verifyToken, requireBuyer);

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management endpoints (Buyer only)
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart (may be empty)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *             example:
 *               _id: "671234abcd5678ef90123456"
 *               userId: "64f7d456789abc123def4567"
 *               items:
 *                 - product: { name: "Monstera", price: 799 }
 *                   quantity: 2
 *               totalItems: 3
 *               totalPrice: 2397
 *       401:
 *         description: Unauthorized - invalid or missing token
 */
router.get("/", getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 64f8e123abc456def7890123
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       201:
 *         description: Product added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Invalid input / product not found / insufficient stock
 *       401:
 *         description: Unauthorized
 */
router.post("/add", addToCart);

/**
 * @swagger
 * /api/cart/update:
 *   put:
 *     summary: Update quantity of an item in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 64f8e123abc456def7890123
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *     responses:
 *       200:
 *         description: Cart item quantity updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Invalid quantity / item not found in cart
 *       401:
 *         description: Unauthorized
 */
router.put("/update", updateCartItem);

/**
 * @swagger
 * /api/cart/remove/{productId}:
 *   delete:
 *     summary: Remove a specific product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to remove from cart
 *         example: 64f8e123abc456def7890123
 *     responses:
 *       200:
 *         description: Product removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Product not found in cart
 *       401:
 *         description: Unauthorized
 */
router.delete("/remove/:productId", removeFromCart);

/**
 * @swagger
 * /api/cart/checkout:
 *   post:
 *     summary: Proceed to checkout (creates pending order with OTP)
 *     description: This endpoint usually triggers the send-otp flow for order confirmation
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checkout initiated - OTP sent to email
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
 *                   example: "OTP sent to your email. Please verify to complete order."
 *                 orderId:
 *                   type: string
 *                   example: 671234abcd5678ef90123456
 *       400:
 *         description: Cart empty / invalid items / checkout not possible
 *       401:
 *         description: Unauthorized
 */
router.post("/checkout", checkout);

export default router;