import express from "express";
import { createBlog, getBlogs, getBlogBySlug, updateBlog, deleteBlog, likeBlog, commentOnBlog } from "../controllers/blog.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

router.get("/", cacheMiddleware("blogs", 3600), getBlogs);
router.get("/:slug", cacheMiddleware("blog", 3600), getBlogBySlug);

// Interaction
router.post("/:id/like", verifyToken, likeBlog);
router.post("/:id/comment", verifyToken, commentOnBlog);

// Only admins should create/update/delete (simple implementation for now)
router.post("/", verifyToken, createBlog);
router.put("/:id", verifyToken, updateBlog);
router.delete("/:id", verifyToken, deleteBlog);


export default router;
