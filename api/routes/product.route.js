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
  searchProducts,
} from "../controllers/product.controller.js";
import { verifyToken, requireSeller } from "../middleware/verifyToken.js";
import upload from "../upload.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get recent products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of recent products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", getRecentProducts);

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name (e.g., Plants, Pots, Seeds)
 *         example: Plants
 *     responses:
 *       200:
 *         description: List of products in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/category/:category", getProductsByCategory);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword
 *         example: rose
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *         example: 1
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 */
router.get("/search", searchProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Add a new product (Seller only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid input / Missing fields
 *       401:
 *         description: Unauthorized
 */
router.post("/", verifyToken, requireSeller, upload.single("image"), addProduct);

/**
 * @swagger
 * /api/products/seller:
 *   get:
 *     summary: Get all products of the authenticated seller
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller's products
 */
router.get("/seller", verifyToken, requireSeller, getSellerProducts);

/**
 * @swagger
 * /api/products/top-sales:
 *   get:
 *     summary: Get top selling products (seller dashboard)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top sales list
 */
router.get("/top-sales", verifyToken, requireSeller, getTopSales);

/**
 * @swagger
 * /api/products/recent-sales:
 *   get:
 *     summary: Get recent sales (seller dashboard)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent sales list
 */
router.get("/recent-sales", verifyToken, requireSeller, getRecentSales);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Seller only - must own the product)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *       403:
 *         description: Not authorized to update this product
 *       404:
 *         description: Product not found
 */
router.put("/:id", verifyToken, requireSeller, updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (Seller only - must own the product)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       403:
 *         description: Not authorized to delete this product
 *       404:
 *         description: Product not found
 */
router.delete("/:id", verifyToken, requireSeller, deleteProduct);

export default router;