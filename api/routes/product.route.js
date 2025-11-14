import express from "express";
import {
  addProduct,
  getSellerProducts,
  getRecentProducts,
  getProductsByCategory, // ← ADD THIS
} from "../controllers/product.controller.js";
import upload from "../upload.js";
import { verifyToken, requireSeller } from "../middleware/verifyToken.js";

const router = express.Router();

// PUBLIC: Homepage recent products
router.get("/", getRecentProducts);

// PUBLIC: Get by category → /api/products/category/Plants
router.get("/category/:category", getProductsByCategory);

// SELLER: Add product
router.post("/", verifyToken, requireSeller, upload.single("image"), addProduct);

// SELLER: Get own products
router.get("/seller", verifyToken, requireSeller, getSellerProducts);

export default router;