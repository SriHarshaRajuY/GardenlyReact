// api/routes/product.route.js
import express from "express";
import {
  getRecentProducts,
  getProductsByCategory,
  addProduct,
  editProduct,
  deleteProduct,
  getSellerProducts,
  getTopSales,
  getRecentSales,
} from "../controllers/product.controller.js";
import upload from "../upload.js"; // ← Import from upload.js
import { isAuthenticated, isSeller } from "../middlewares.js";

const router = express.Router();

// Public routes
router.get("/recent", getRecentProducts);
router.get("/category/:category", getProductsByCategory);

// Seller routes
router.post("/", isAuthenticated, isSeller, upload.single("image"), addProduct);
router.get("/seller", isAuthenticated, isSeller, getSellerProducts);
router.put("/:id", isAuthenticated, isSeller, editProduct);
router.delete("/:id", isAuthenticated, isSeller, deleteProduct);
router.get("/top-sales", isAuthenticated, isSeller, getTopSales);
router.get("/recent-sales", isAuthenticated, isSeller, getRecentSales);

export default router;