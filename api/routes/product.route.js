import express from "express";
import {
  getRecentProducts,
  getProductsByCategory,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/recent", getRecentProducts);
router.get("/category/:category", getProductsByCategory);

export default router;
