// server/routes/auth.route.js
import express from "express";
import { signup, signin } from "../controllers/auth.controller.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);

router.get("/check", (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.json({ isAuthenticated: false });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ isAuthenticated: true, role: payload.role, username: payload.username });
  } catch {
    res.json({ isAuthenticated: false });
  }
});

export default router;