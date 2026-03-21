import express from "express";
import { signup, signin, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 */

router.post("/signup", signup);

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 */

router.post("/signin", signin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/check", (req, res) => {
  const token = req.cookies?.access_token;
  if (!token) return res.json({ isAuthenticated: false });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      isAuthenticated: true,
      role: payload.role,
      username: payload.username,
    });
  } catch {
    res.json({ isAuthenticated: false });
  }
});

export default router;