// api/controllers/user.controller.js
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import { errorHandler } from "../utils/error.js";

/**
 * GET /api/user/me
 * Return current user's profile + order history
 */
export const getProfile = async (req, res, next) => {
  try {
    // 1) Load user (without password + otp fields)
    const user = await User.findById(req.user.id).select(
      "-password -resetOtp -resetOtpExpiresAt"
    );

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // 2) Load orders
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name image price");

    // Stats for the UI
    const totalOrders = orders.length;
    const confirmedOrders = orders.filter(
      (o) => o.status === "confirmed"
    ).length;
    const cancelledOrders = orders.filter(
      (o) => o.status === "cancelled"
    ).length;
    const pendingOrders = orders.filter(
      (o) => o.status === "pending_otp"
    ).length;

    const totalSpent = orders
      .filter((o) => o.status === "confirmed")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({
      success: true,
      user,
      stats: {
        totalOrders,
        confirmedOrders,
        cancelledOrders,
        pendingOrders,
        totalSpent,
      },
      orders,
    });
  } catch (err) {
    next(err);
  }
};
