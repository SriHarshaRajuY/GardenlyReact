// api/routes/order.route.js
import express from "express";
import { verifyToken, requireBuyer } from "../middleware/verifyToken.js";
import { sendOrderOtp, verifyOrderOtp } from "../controllers/order.controller.js";

const router = express.Router();

router.use(verifyToken, requireBuyer);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order placement & OTP verification endpoints (Buyer only)
 */

/**
 * @swagger
 * /api/orders/send-otp:
 *   post:
 *     summary: Send OTP to confirm order (starts order process)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - address1
 *               - city
 *               - state
 *               - pincode
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Pardhu Va
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               address1:
 *                 type: string
 *                 example: "Flat 301, Green View Apartments"
 *               address2:
 *                 type: string
 *                 example: "Near KBR Park"
 *               city:
 *                 type: string
 *                 example: Hyderabad
 *               state:
 *                 type: string
 *                 example: Telangana
 *               pincode:
 *                 type: string
 *                 example: "500034"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 orderId:
 *                   type: string
 *       400:
 *         description: Validation error / empty cart / invalid amount
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post("/send-otp", sendOrderOtp);

/**
 * @swagger
 * /api/orders/verify-otp:
 *   post:
 *     summary: Verify OTP and confirm order (deducts stock, clears cart)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - otp
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: 64f8e123abc456def7890123
 *               otp:
 *                 type: string
 *                 example: "483920"
 *     responses:
 *       200:
 *         description: Order confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 orderId:
 *                   type: string
 *       400:
 *         description: Invalid/expired OTP / insufficient stock / already processed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post("/verify-otp", verifyOrderOtp);

export default router;