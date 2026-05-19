import Community from "../models/community.model.js";
import CommunityPost from "../models/communityPost.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { clearCache } from "../utils/cache.js";
import mongoose from "mongoose";

const clearCommunityCaches = async () => {
  await Promise.all([
    clearCache("communities"),
    clearCache("posts"),
    clearCache("user_profile"),
  ]);
};

const COMMUNITY_CATEGORIES = ["Plants", "Seeds", "Pots", "Tips", "General"];

const isMember = (community, userId) =>
  community.members?.some((memberId) => memberId.toString() === userId);

const getCommunityForMemberAction = async (communityId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(communityId)) {
    throw errorHandler(400, "Invalid community ID");
  }

  const community = await Community.findById(communityId);
  if (!community) throw errorHandler(404, "Community not found");
  if (!isMember(community, userId)) {
    throw errorHandler(403, "Join this community before interacting with posts");
  }

  return community;
};

// --- Communities ---

export const createCommunity = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const description = req.body.description?.trim();
    const category = COMMUNITY_CATEGORIES.includes(req.body.category)
      ? req.body.category
      : "General";
    const image = req.body.image?.trim();

    if (!name || !description) {
      return next(errorHandler(400, "Community name and description are required"));
    }

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
    await clearCommunityCaches();

    res.status(201).json({ success: true, community: newCommunity });
  } catch (err) {
    next(err);
  }
};

export const joinCommunity = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid community ID"));
    }

    const community = await Community.findById(req.params.id);
    if (!community) return next(errorHandler(404, "Community not found"));

    await Community.findByIdAndUpdate(req.params.id, { $addToSet: { members: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { joinedCommunities: req.params.id } });
    await clearCommunityCaches();

    res.status(200).json({ success: true, message: "Joined successfully" });
  } catch (err) {
    next(err);
  }
};

export const leaveCommunity = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid community ID"));
    }

    const community = await Community.findById(req.params.id);
    if (!community) return next(errorHandler(404, "Community not found"));
    if (community.name === "World Community") return next(errorHandler(400, "You cannot leave the World Community"));

    await Community.findByIdAndUpdate(req.params.id, { $pull: { members: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, { $pull: { joinedCommunities: req.params.id } });
    await clearCommunityCaches();

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
    const cleanContent = content?.trim();

    if (!cleanContent) {
      return next(errorHandler(400, "Post content is required"));
    }

    await getCommunityForMemberAction(communityId, req.user.id);

    const newPost = new CommunityPost({
      communityId,
      userId: req.user.id,
      username: req.user.username || "Anonymous",
      content: cleanContent,
      mediaUrl: mediaUrl?.trim(),
      mediaType: mediaType || "none",
    });
    await newPost.save();
    await clearCommunityCaches();
    res.status(201).json({ success: true, post: newPost });
  } catch (err) {
    next(err);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const { communityId } = req.query;
    await getCommunityForMemberAction(communityId, req.user.id);
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

    await getCommunityForMemberAction(post.communityId, req.user.id);

    const index = post.likes.findIndex((userId) => userId.toString() === req.user.id);
    if (index === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    await clearCommunityCaches();
    res.status(200).json({ success: true, likes: post.likes });
  } catch (err) {
    next(err);
  }
};

export const commentOnPost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return next(errorHandler(404, "Post not found"));
    const cleanText = req.body.text?.trim();
    if (!cleanText) return next(errorHandler(400, "Comment text is required"));

    await getCommunityForMemberAction(post.communityId, req.user.id);

    const comment = {
      userId: req.user.id,
      username: req.user.username || "Anonymous",
      text: cleanText,
    };

    post.comments.push(comment);
    await post.save();
    await clearCommunityCaches();
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
    if (!community) return next(errorHandler(404, "Community not found"));

    const isAuthor = post.userId.toString() === req.user.id;
    const isCommunityAdmin = community.adminId?.toString() === req.user.id;
    if (!isAuthor && !isCommunityAdmin) {
       return next(errorHandler(403, "Not authorized to delete this post"));
    }

    await CommunityPost.findByIdAndDelete(req.params.id);
    await clearCommunityCaches();
    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};
