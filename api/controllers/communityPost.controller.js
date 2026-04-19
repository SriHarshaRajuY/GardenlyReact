import CommunityPost from "../models/communityPost.model.js";
import { errorHandler } from "../utils/error.js";

export const createPost = async (req, res, next) => {
  try {
    const { title, description, image } = req.body;
    const newPost = new CommunityPost({
      userId: req.user.id,
      username: req.user.username || "Anonymous",
      title,
      description,
      image,
    });
    await newPost.save();
    res.status(201).json({ success: true, post: newPost });
  } catch (err) {
    next(err);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (err) {
    next(err);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return next(errorHandler(404, "Post not found"));

    const index = post.likes.indexOf(req.user.id);
    if (index === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.status(200).json({ success: true, likes: post.likes.length });
  } catch (err) {
    next(err);
  }
};

export const commentOnPost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return next(errorHandler(404, "Post not found"));

    const comment = {
      userId: req.user.id,
      username: req.user.username || "Anonymous",
      text: req.body.text,
    };

    post.comments.push(comment);
    await post.save();
    res.status(201).json({ success: true, comments: post.comments });
  } catch (err) {
    next(err);
  }
};
