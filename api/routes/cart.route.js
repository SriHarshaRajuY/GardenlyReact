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

// all cart routes require a logged-in buyer
router.use(verifyToken, requireBuyer);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:productId", removeFromCart);
router.post("/checkout", checkout);

export default router;
