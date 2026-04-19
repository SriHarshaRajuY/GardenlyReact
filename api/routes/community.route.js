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

const router = express.Router();

// Community management
router.get("/", verifyToken, getCommunities);
router.post("/", verifyToken, createCommunity);
router.post("/join/:id", verifyToken, joinCommunity);
router.post("/leave/:id", verifyToken, leaveCommunity);

// Posts
router.get("/posts", verifyToken, getPosts);
router.post("/posts", verifyToken, createPost);
router.post("/posts/:id/like", verifyToken, likePost);
router.post("/posts/:id/comment", verifyToken, commentOnPost);
router.delete("/posts/:id", verifyToken, deletePost);

export default router;
