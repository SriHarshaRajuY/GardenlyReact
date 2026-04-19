// api/routes/product.route.js
import express from "express";
import {
  addProduct,
  getSellerProducts,
  getRecentProducts,
  getTopSales,
  getRecentSales,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,          // ✅ NEW
} from "../controllers/product.controller.js";
import { verifyToken, requireSeller } from "../middleware/verifyToken.js";
import upload from "../upload.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// public (Cached for 1 hour = 3600 seconds)
router.get("/", cacheMiddleware("products", 3600), getRecentProducts);
router.get("/category/:category", cacheMiddleware("products:category", 3600), getProductsByCategory);
router.get("/search", cacheMiddleware("products:search", 600), searchProducts);        // ✅ /api/products/search?q=rose

// seller only
router.post("/", verifyToken, requireSeller, upload.single("image"), addProduct);
router.get("/seller", verifyToken, requireSeller, getSellerProducts);
router.get("/top-sales", verifyToken, requireSeller, getTopSales);
router.get("/recent-sales", verifyToken, requireSeller, getRecentSales);
router.put("/:id", verifyToken, requireSeller, updateProduct);
router.delete("/:id", verifyToken, requireSeller, deleteProduct);

export default router;
