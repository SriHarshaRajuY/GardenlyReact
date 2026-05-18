import express from "express";
import { createBlog, getBlogs, getBlogBySlug, updateBlog, deleteBlog, likeBlog, commentOnBlog } from "../controllers/blog.controller.js";
import { verifyToken, requireAdmin } from "../middleware/verifyToken.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

router.get("/", cacheMiddleware("blogs", 3600), getBlogs);
router.get("/:slug", cacheMiddleware("blog", 3600), getBlogBySlug);

// Interaction
router.post("/:id/like", verifyToken, likeBlog);
router.post("/:id/comment", verifyToken, commentOnBlog);

// Admin-only content management
router.post("/", verifyToken, requireAdmin, createBlog);
router.put("/:id", verifyToken, requireAdmin, updateBlog);
router.delete("/:id", verifyToken, requireAdmin, deleteBlog);


export default router;
