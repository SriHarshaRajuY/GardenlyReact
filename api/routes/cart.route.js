
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

router.use(verifyToken, requireBuyer);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:productId", removeFromCart);
router.post("/checkout", checkout);

export default router;