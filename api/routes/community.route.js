import express from "express";
import { 
  createCommunity, 
  joinCommunity, 
  leaveCommunity, 
  getCommunities, 
  createPost, 
  getPosts, 
  likePost, 
  commentOnPost, 
  deletePost 
} from "../controllers/community.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// Community management
router.get("/", verifyToken, cacheMiddleware("communities", 3600), getCommunities);
router.post("/", verifyToken, createCommunity);
router.post("/join/:id", verifyToken, joinCommunity);
router.post("/leave/:id", verifyToken, leaveCommunity);

// Posts
router.get("/posts", verifyToken, cacheMiddleware("posts", 3600), getPosts);
router.post("/posts", verifyToken, createPost);
router.post("/posts/:id/like", verifyToken, likePost);
router.post("/posts/:id/comment", verifyToken, commentOnPost);
router.delete("/posts/:id", verifyToken, deletePost);

export default router;
