import express from "express";
import { verifyToken, requireAdmin } from "../middleware/verifyToken.js";
import {
  getAdminDashboard,
  getAllUsers,
  getAllProducts,
  deleteUser,
  deleteProduct,
  getAllOrders,
  getAllTickets,
  resolveTicket,
  getAllBlogs,
  deleteBlog,
  getAllCommunities,
  deleteCommunity,
  getAllPosts,
  deletePost,
  getAllCustomRequests,
  deleteCustomRequest,
} from "../controllers/admin.controller.js";

const router = express.Router();

/* ================= ADMIN DASHBOARD ================= */
router.get("/dashboard", verifyToken, requireAdmin, getAdminDashboard);

/* ================= USERS ================= */
router.get("/users", verifyToken, requireAdmin, getAllUsers);
router.delete("/users/:id", verifyToken, requireAdmin, deleteUser);

/* ================= PRODUCTS ================= */
router.get("/products", verifyToken, requireAdmin, getAllProducts);
router.delete("/products/:id", verifyToken, requireAdmin, deleteProduct);

/* ================= ORDERS ================= */
router.get("/orders", verifyToken, requireAdmin, getAllOrders);

/* ================= TICKETS ================= */
router.get("/tickets", verifyToken, requireAdmin, getAllTickets);
router.patch("/tickets/:id/resolve", verifyToken, requireAdmin, resolveTicket);

/* ================= BLOGS ================= */
router.get("/blogs", verifyToken, requireAdmin, getAllBlogs);
router.delete("/blogs/:id", verifyToken, requireAdmin, deleteBlog);

/* ================= COMMUNITIES ================= */
router.get("/communities", verifyToken, requireAdmin, getAllCommunities);
router.delete("/communities/:id", verifyToken, requireAdmin, deleteCommunity);

/* ================= COMMUNITY POSTS ================= */
router.get("/posts", verifyToken, requireAdmin, getAllPosts);
router.delete("/posts/:id", verifyToken, requireAdmin, deletePost);

/* ================= CUSTOM REQUESTS ================= */
router.get("/custom-requests", verifyToken, requireAdmin, getAllCustomRequests);
router.delete("/custom-requests/:id", verifyToken, requireAdmin, deleteCustomRequest);

export default router;