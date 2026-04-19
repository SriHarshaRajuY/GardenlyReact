import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Ticket from "../models/ticket.model.js";
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
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, buyers: totalBuyers, sellers: totalSellers, experts: totalExperts, admins: totalAdmins },
        products: { total: totalProducts },
        orders: { total: totalOrders, pending: pendingOrders, confirmed: confirmedOrders, cancelled: cancelledOrders, revenue: totalRevenue },
        tickets: { total: ticketsTotal, open: ticketsOpen, resolved: ticketsResolved },
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