// api/controllers/admin.controller.js
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Ticket from "../models/ticket.model.js";
import { errorHandler } from "../utils/error.js";

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      totalExperts,
      totalAdmins,
      totalProducts,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      cancelledOrders,
      ticketsTotal,
      ticketsOpen,
      ticketsResolved,
      revenueAgg,
      recentOrders,
      recentProducts,
      recentBuyers,
      recentSellers,
      recentExperts,
      recentAdmins,
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
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "username")
        .populate("items.product", "name"),

      Product.find({}).sort({ createdAt: -1 }).limit(5),

      // === SEPARATED USERS ===
      User.find({ role: "Buyer" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("username email mobile createdAt"),

      User.find({ role: "Seller" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("username email mobile createdAt"),

      User.find({ role: "Expert" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("username email mobile expertise createdAt"),

      User.find({ role: "Admin" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("username email mobile createdAt"),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          buyers: totalBuyers,
          sellers: totalSellers,
          experts: totalExperts,
          admins: totalAdmins,
        },
        products: { total: totalProducts },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          cancelled: cancelledOrders,
          revenue: totalRevenue,
        },
        tickets: {
          total: ticketsTotal,
          open: ticketsOpen,
          resolved: ticketsResolved,
        },
      },
      recentOrders,
      recentProducts,
      recentBuyers,
      recentSellers,
      recentExperts,
      recentAdmins,
    });
  } catch (err) {
    next(errorHandler(500, "Failed to load admin dashboard stats"));
  }
};