import Community from "../models/community.model.js";
import CommunityPost from "../models/communityPost.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// --- Communities ---

export const createCommunity = async (req, res, next) => {
  try {
    const { name, description, category, image } = req.body;
    const newCommunity = new Community({
      name,
      description,
      category,
      image,
      adminId: req.user.id,
      members: [req.user.id],
    });
    await newCommunity.save();

    // Add to user's joined list
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { joinedCommunities: newCommunity._id } });

    res.status(201).json({ success: true, community: newCommunity });
  } catch (err) {
    next(err);
  }
};

export const joinCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return next(errorHandler(404, "Community not found"));

    await Community.findByIdAndUpdate(req.params.id, { $addToSet: { members: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { joinedCommunities: req.params.id } });

    res.status(200).json({ success: true, message: "Joined successfully" });
  } catch (err) {
    next(err);
  }
};

export const leaveCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return next(errorHandler(404, "Community not found"));
    if (community.name === "World Community") return next(errorHandler(400, "You cannot leave the World Community"));

    await Community.findByIdAndUpdate(req.params.id, { $pull: { members: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, { $pull: { joinedCommunities: req.params.id } });

    res.status(200).json({ success: true, message: "Left successfully" });
  } catch (err) {
    next(err);
  }
};

export const getCommunities = async (req, res, next) => {
  try {
    const joined = await Community.find({ members: req.user.id });
    const suggested = await Community.find({ members: { $ne: req.user.id } }).limit(5);
    res.status(200).json({ success: true, joined, suggested });
  } catch (err) {
    next(err);
  }
};

// --- Posts ---

export const createPost = async (req, res, next) => {
  try {
    const { communityId, content, mediaUrl, mediaType } = req.body;
    const newPost = new CommunityPost({
      communityId,
      userId: req.user.id,
      username: req.user.username || "Anonymous",
      content,
      mediaUrl,
      mediaType: mediaType || "none",
    });
    await newPost.save();
    res.status(201).json({ success: true, post: newPost });
  } catch (err) {
    next(err);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const { communityId } = req.query;
    const posts = await CommunityPost.find({ communityId }).sort({ createdAt: -1 });
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
    res.status(200).json({ success: true, likes: post.likes });
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

export const deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return next(errorHandler(404, "Post not found"));

    // Check if user is the author or the community admin
    const community = await Community.findById(post.communityId);
    if (post.userId.toString() !== req.user.id && community.adminId.toString() !== req.user.id) {
       return next(errorHandler(403, "Not authorized to delete this post"));
    }

    await CommunityPost.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};
