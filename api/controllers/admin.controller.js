import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Ticket from "../models/ticket.model.js";
import { errorHandler } from "../utils/error.js";

/* ================= ADMIN DASHBOARD ================= */
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
  { $group: { _id: null, total: { $sum: "$totalAdminCommission" } } },
]),

      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "username")
        .populate("items.product", "name"),

      Product.find({}).sort({ createdAt: -1 }).limit(5),

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

/* ================= GET ALL USERS ================= */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select("-password -resetOtp -resetOtpExpiresAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    next(errorHandler(500, "Failed to fetch users"));
  }
};

/* ================= GET ALL PRODUCTS ================= */
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({})
      .populate("seller_id", "username email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    next(errorHandler(500, "Failed to fetch products"));
  }
};

export const approveSeller = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const validActions = ['approve', 'reject', 'suspend'];
    if (!validActions.includes(action)) {
      return next(errorHandler(400, `Invalid action. Allowed: ${validActions.join(', ')}`));
    }

    if (action !== 'approve' && !reason?.trim()) {
      return next(errorHandler(400, 'Reason is required when rejecting or suspending'));
    }

    const seller = await User.findOne({ _id: id, role: 'seller' });
    if (!seller) {
      return next(errorHandler(404, 'Seller not found or not a seller account'));
    }

    if (seller.isApproved && action === 'approve') {
      return next(errorHandler(400, 'Seller is already approved'));
    }

    // Update logic
    seller.isApproved = action === 'approve';
    seller.status     = action === 'approve' ? 'active' : action === 'reject' ? 'rejected' : 'suspended';
    seller.approvedAt = action === 'approve' ? new Date() : null;
    seller.approvalReason = reason?.trim() || seller.approvalReason || `Admin action: ${action}`;

    await seller.save();

    // Optional: send email notification to seller here

    res.json({
      success: true,
      message: `Seller ${action}d successfully`,
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        isApproved: seller.isApproved,
        status: seller.status,
        approvalReason: seller.approvalReason,
        approvedAt: seller.approvedAt,
      }
    });
  } catch (err) {
    next(err);
  }
};

export const moderateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    if (!["hide", "show", "delete", "restore"].includes(action)) {
      return next(errorHandler(400, "Invalid action: hide, show, delete, restore"));
    }

    const product = await Product.findById(id);
    if (!product) {
      return next(errorHandler(404, "Product not found"));
    }

    if (action === "hide") {
      product.isActive = false;
      product.adminNote = reason || "Hidden by admin";
    } else if (action === "show") {
      product.isActive = true;
      product.adminNote = reason || "Restored by admin";
    } else if (action === "delete") {
      product.isDeleted = true; // soft delete if you use this pattern
      product.adminNote = reason || "Deleted by admin";
    } else if (action === "restore") {
      product.isDeleted = false;
      product.isActive = true;
      product.adminNote = reason || "Restored by admin";
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${action}d successfully`,
      product: {
        _id: product._id,
        name: product.name,
        isActive: product.isActive,
        isDeleted: product.isDeleted || false,
        adminNote: product.adminNote,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.status) query.status = req.query.status;
    if (req.query.sellerId) query["items.product.seller_id"] = req.query.sellerId;
    if (req.query.buyerId) query.userId = req.query.buyerId;
    if (req.query.fromDate) query.createdAt = { $gte: new Date(req.query.fromDate) };
    if (req.query.toDate) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$lte = new Date(req.query.toDate);
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email phone")
      .populate({
        path: "items.product",
        select: "name slug price image seller_id",
        populate: {
          path: "seller_id",
          select: "name email phone slug"
        }
      })
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};