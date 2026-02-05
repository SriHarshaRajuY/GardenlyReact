// api/routes/user.route.js
import express from "express";
import { getProfile } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Current logged-in user's profile + orders
// GET /api/user/me
router.get("/me", verifyToken, getProfile);

export default router;
