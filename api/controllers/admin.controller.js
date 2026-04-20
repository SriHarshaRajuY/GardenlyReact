import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Ticket from "../models/ticket.model.js";
import Blog from "../models/blog.model.js";
import Community from "../models/community.model.js";
import CommunityPost from "../models/communityPost.model.js";
import CustomRequest from "../models/customRequest.model.js";
import { errorHandler } from "../utils/error.js";

/* ================= ADMIN DASHBOARD ================= */
export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers, totalBuyers, totalSellers, totalExperts, totalAdmins,
      totalProducts, totalOrders, pendingOrders, confirmedOrders, cancelledOrders,
      ticketsTotal, ticketsOpen, ticketsResolved,
      revenueAgg, recentOrders, recentProducts,
      recentBuyers, recentSellers, recentExperts, recentAdmins,
      totalBlogs, totalCommunities, totalPosts, totalCustomRequests
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "Buyer" }),
      User.countDocuments({ role: "Seller" }),
      User.countDocuments({ role: "Expert" }),
      User.countDocuments({ role: "Admin" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: "pending_otp" }),
      Order.countDocuments({ status: "confirmed" }),
      Order.countDocuments({ status: "cancelled" }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: "Open" }),
      Ticket.countDocuments({ status: "Resolved" }),
      Order.aggregate([
        { $match: { status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$totalAdminCommission" } } },
      ]),
      Order.find({}).sort({ createdAt: -1 }).limit(5).populate("userId", "username").populate("items.product", "name"),
      Product.find({}).sort({ createdAt: -1 }).limit(5),
      User.find({ role: "Buyer" }).sort({ createdAt: -1 }).limit(5).select("username email mobile createdAt"),
      User.find({ role: "Seller" }).sort({ createdAt: -1 }).limit(5).select("username email mobile createdAt"),
      User.find({ role: "Expert" }).sort({ createdAt: -1 }).limit(5).select("username email mobile expertise createdAt"),
      User.find({ role: "Admin" }).sort({ createdAt: -1 }).limit(5).select("username email mobile createdAt"),
      Blog.countDocuments(),
      Community.countDocuments(),
      CommunityPost.countDocuments(),
      CustomRequest.countDocuments(),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, buyers: totalBuyers, sellers: totalSellers, experts: totalExperts, admins: totalAdmins },
        products: { total: totalProducts },
        orders: { total: totalOrders, pending: pendingOrders, confirmed: confirmedOrders, cancelled: cancelledOrders, revenue: totalRevenue },
        tickets: { total: ticketsTotal, open: ticketsOpen, resolved: ticketsResolved },
        blogs: { total: totalBlogs },
        communities: { total: totalCommunities },
        posts: { total: totalPosts },
        customRequests: { total: totalCustomRequests },
      },
      recentOrders, recentProducts, recentBuyers, recentSellers, recentExperts, recentAdmins,
    });
  } catch (err) {
    next(errorHandler(500, "Failed to load admin dashboard stats"));
  }
};

/* ================= GET ALL USERS ================= */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password -resetOtp -resetOtpExpiresAt -emailVerificationOtp -twoFactorOtp").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(errorHandler(500, "Failed to fetch users"));
  }
};

/* ================= DELETE USER ================= */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(errorHandler(404, "User not found"));
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(errorHandler(500, "Failed to delete user"));
  }
};

/* ================= GET ALL PRODUCTS ================= */
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate("seller_id", "username email").sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(errorHandler(500, "Failed to fetch products"));
  }
};

/* ================= DELETE PRODUCT ================= */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(errorHandler(404, "Product not found"));
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    next(errorHandler(500, "Failed to delete product"));
  }
};

/* ================= GET ALL ORDERS ================= */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "username email")
      .populate("items.product", "name price image");
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(errorHandler(500, "Failed to fetch orders"));
  }
};

/* ================= GET ALL TICKETS ================= */
export const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({})
      .sort({ createdAt: -1 })
      .populate("expert_id", "username email");
    res.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    next(errorHandler(500, "Failed to fetch tickets"));
  }
};

/* ================= RESOLVE TICKET ================= */
export const resolveTicket = async (req, res, next) => {
  try {
    const { resolution } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: "Resolved", resolution },
      { new: true }
    );
    if (!ticket) return next(errorHandler(404, "Ticket not found"));
    res.json({ success: true, message: "Ticket resolved", ticket });
  } catch (err) {
    next(errorHandler(500, "Failed to resolve ticket"));
  }
};

/* ================= GET ALL BLOGS ================= */
export const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: blogs.length, blogs });
  } catch (err) {
    next(errorHandler(500, "Failed to fetch blogs"));
  }
};

/* ================= DELETE BLOG ================= */
export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return next(errorHandler(404, "Blog not found"));
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    next(errorHandler(500, "Failed to delete blog"));
  }
};

/* ================= GET ALL COMMUNITIES ================= */
export const getAllCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find({}).populate("adminId", "username email").sort({ createdAt: -1 });
    res.json({ success: true, count: communities.length, communities });
  } catch (err) {
    next(errorHandler(500, "Failed to fetch communities"));
  }
};

/* ================= DELETE COMMUNITY ================= */
export const deleteCommunity = async (req, res, next) => {
  try {
    const community = await Community.findByIdAndDelete(req.params.id);
    if (!community) return next(errorHandler(404, "Community not found"));
    // Also delete all posts associated with this community
    await CommunityPost.deleteMany({ communityId: req.params.id });
    res.json({ success: true, message: "Community and its posts deleted successfully" });
  } catch (err) {
    next(errorHandler(500, "Failed to delete community"));
  }
};

/* ================= GET ALL POSTS ================= */
export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await CommunityPost.find({})
      .populate("communityId", "name")
      .populate("userId", "username email")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    next(errorHandler(500, "Failed to fetch posts"));
  }
};

/* ================= DELETE POST ================= */
export const deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findByIdAndDelete(req.params.id);
    if (!post) return next(errorHandler(404, "Post not found"));
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    next(errorHandler(500, "Failed to delete post"));
  }
};

/* ================= GET ALL CUSTOM REQUESTS ================= */
export const getAllCustomRequests = async (req, res, next) => {
  try {
    const requests = await CustomRequest.find({})
      .populate("buyer_id", "username email")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    next(errorHandler(500, "Failed to fetch custom requests"));
  }
};

/* ================= DELETE CUSTOM REQUEST ================= */
export const deleteCustomRequest = async (req, res, next) => {
  try {
    const request = await CustomRequest.findByIdAndDelete(req.params.id);
    if (!request) return next(errorHandler(404, "Custom request not found"));
    res.json({ success: true, message: "Custom request deleted successfully" });
  } catch (err) {
    next(errorHandler(500, "Failed to delete custom request"));
  }
};