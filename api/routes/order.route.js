// api/routes/order.route.js
import express from "express";
import { verifyToken, requireBuyer } from "../middleware/verifyToken.js";
import { sendOrderOtp, verifyOrderOtp } from "../controllers/order.controller.js";

const router = express.Router();

router.use(verifyToken, requireBuyer);

// POST /api/orders/send-otp
router.post("/send-otp", sendOrderOtp);

// POST /api/orders/verify-otp
router.post("/verify-otp", verifyOrderOtp);

export default router;

//orders route 