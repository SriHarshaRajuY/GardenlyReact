import express from "express";
import {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  googleSignin,
  verifyEmail,
  verify2FA,
} from "../controllers/auth.controller.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/signin", signin);
router.post("/verify-2fa", verify2FA);
router.post("/google", googleSignin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("access_token", {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

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