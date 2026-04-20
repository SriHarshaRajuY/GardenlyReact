// api/routes/user.route.js
import express from "express";
import { getProfile } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// Current logged-in user's profile + orders
// GET /api/user/me
router.get("/me", verifyToken, cacheMiddleware("user_profile", 60), getProfile);

export default router;

// implemented using express router 
