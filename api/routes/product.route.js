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
} from "../controllers/product.controller.js";
import { verifyToken, requireSeller } from "../middleware/verifyToken.js";
import upload from "../upload.js";

const router = express.Router();

// public
router.get("/", getRecentProducts);
router.get("/category/:category", getProductsByCategory);

// seller only
router.post("/", verifyToken, requireSeller, upload.single("image"), addProduct);
router.get("/seller", verifyToken, requireSeller, getSellerProducts);
router.get("/top-sales", verifyToken, requireSeller, getTopSales);
router.get("/recent-sales", verifyToken, requireSeller, getRecentSales);
router.put("/:id", verifyToken, requireSeller, updateProduct);
router.delete("/:id", verifyToken, requireSeller, deleteProduct);

export default router;