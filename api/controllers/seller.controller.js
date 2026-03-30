import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

/**
 * GET /api/seller/orders
 * Return only confirmed sales belonging to logged-in seller
 */
export const getSellerOrders = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    // 1️⃣ Find only confirmed orders
    const orders = await Order.find({ status: "confirmed" })
      .sort({ createdAt: -1 })
      .populate("userId", "username email mobile")
      .populate("items.product");

    const sellerSales = [];

    // 2️⃣ Extract only items that belong to this seller
    for (const order of orders) {
      for (const item of order.items) {
        if (!item.product) continue;

        if (item.product.seller_id?.toString() === sellerId) {
          sellerSales.push({
            orderId: order._id,
            productId: item.product._id,
            productName: item.product.name,
            productImage: item.product.image,
            quantity: item.quantity,
            price: item.price,

            // ✅ Seller actual earning (90%)
            total: item.sellerEarning,

            // show platform fee (nice marketplace feature)
            adminCommission: item.adminCommission,

            buyer: {
              name: order.billing.fullName,
              phone: order.billing.phone,
              address: `${order.billing.address1}, ${order.billing.city}, ${order.billing.state} - ${order.billing.pincode}`,
            },
            date: order.createdAt,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      count: sellerSales.length,
      sales: sellerSales,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/seller/summary
 * Dashboard statistics
 */
export const getSellerSummary = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    // seller products
    const products = await Product.find({ seller_id: sellerId });

    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const totalUnitsSold = products.reduce((sum, p) => sum + (p.sold || 0), 0);

    // confirmed orders
    const orders = await Order.find({ status: "confirmed" }).populate("items.product");

    let totalEarnings = 0;

    // ✅ Now calculate earnings using sellerEarning (not full price)
    for (const order of orders) {
      for (const item of order.items) {
        if (!item.product) continue;

        if (item.product.seller_id?.toString() === sellerId) {
          totalEarnings += item.sellerEarning || 0;
        }
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        outOfStock,
        totalUnitsSold,
        totalEarnings,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/seller/orders/:orderId/shipping
 * Mark an order as shipped
 */
export const updateOrderShippingStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber, courier } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return next(errorHandler(404, "Order not found"));

    // Check if this seller has items in this order
    const hasItem = order.items.some(
      (item) => item.product?.seller_id?.toString() === req.user._id.toString()
    );
    if (!hasItem) return next(errorHandler(403, "Not authorized for this order"));

    // Update order status and tracking info
    order.status = "shipped";
    order.tracking = { number: trackingNumber, courier, updatedAt: new Date() };

    await order.save();

    res.json({
      success: true,
      message: "Order marked as shipped",
      order,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/seller/products
 * List only the authenticated seller's products with pagination & basic filters
 */
export const getSellerProducts = async (req, res, next) => {
  try {
    const sellerId = req.user._id; // safer than .id

    // Query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { seller_id: sellerId }; // core filter - only own products

    // Optional filters
    if (req.query.status) {
      if (req.query.status === "active") query.isActive = true;
      else if (req.query.status === "inactive") query.isActive = false;
      else if (req.query.status === "outofstock") query.quantity = 0;
    }

    if (req.query.lowStock === "true") {
      query.quantity = { $lte: 5, $gte: 0 }; // low stock but not negative
    }

    // Sort options
    let sort = { createdAt: -1 }; // default: newest first
    if (req.query.sort) {
      switch (req.query.sort) {
        case "oldest":      sort = { createdAt: 1 }; break;
        case "price-asc":   sort = { price: 1 }; break;
        case "price-desc":  sort = { price: -1 }; break;
        case "sold-desc":   sort = { sold: -1 }; break;
        // newest is default
      }
    }

    // Fetch products
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("name slug price image category quantity sold isActive createdAt updatedAt") // pick useful fields
      .lean(); // faster response

    // Total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

export const getSellerCreateProduct = async (req, res, next) => {
  try {
    const sellerId = req.user._id;

    const productData = {
      ...req.body,
      seller_id: sellerId,
      createdBy: sellerId, // optional - if you track who created
      slug: req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    };

    const newProduct = await Product.create(productData);

    res.status(201).json({
      success: true,
      product: newProduct,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(errorHandler(400, Object.values(err.errors)[0].message));
    }
    next(err);
  }
};

export const updateSellerProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    const product = await Product.findOne({ _id: id, seller_id: sellerId });
    if (!product) {
      return next(errorHandler(404, "Product not found or not yours"));
    }

    // Only allow certain fields to be updated by seller
    const allowedUpdates = [
      "name",
      "description",
      "price",
      "quantity",
      "image",
      "isActive",
      "tags",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};

export const markOrderAsShipped = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    const order = await Order.findById(id);
    if (!order) {
      return next(errorHandler(404, "Order not found"));
    }

    // Check if this seller has at least one item in the order
    const hasSellerItem = order.items.some(
      (item) => item.product?.seller_id?.toString() === sellerId.toString()
    );

    if (!hasSellerItem) {
      return next(errorHandler(403, "This order does not contain your products"));
    }

    // Update shipping info (you can make this more granular per item later)
    order.status = "shipped";
    order.shippedAt = req.body.shippedAt || new Date();
    order.tracking = {
      number: req.body.trackingNumber,
      courier: req.body.courier,
      updatedAt: new Date(),
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order marked as shipped",
      order,
    });
  } catch (err) {
    next(err);
  }
};

export const getSellerEarnings = async (req, res, next) => {
  try {
    const sellerId = req.user._id;
    const period = req.query.period || "all";

    const matchStage = {
      "items.product.seller_id": sellerId,
      status: { $in: ["confirmed", "shipped", "delivered"] },
    };

    const earnings = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      { $match: { "items.product.seller_id": sellerId } },
      {
        $group: {
          _id: null,
          lifetime: { $sum: "$items.sellerEarning" },
          data: { $push: "$$ROOT" },
        },
      },
    ]);

    let thisMonth = 0;
    let thisYear = 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    if (earnings[0]?.data) {
      earnings[0].data.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        const amount = order.items.sellerEarning || 0;

        if (orderDate >= startOfMonth) thisMonth += amount;
        if (orderDate >= startOfYear) thisYear += amount;
      });
    }

    // Very simplified pending payout (you can make it more accurate later)
    const pendingPayout = await Order.aggregate([
      {
        $match: {
          "items.product.seller_id": sellerId,
          status: "delivered",
          "payoutStatus": { $ne: "paid" }, // assume you add this field later
        },
      },
      { $unwind: "$items" },
      { $match: { "items.product.seller_id": sellerId } },
      { $group: { _id: null, total: { $sum: "$items.sellerEarning" } } },
    ]);

    res.status(200).json({
      success: true,
      earnings: {
        lifetime: earnings[0]?.lifetime || 0,
        thisMonth,
        thisYear,
        pendingPayout: pendingPayout[0]?.total || 0,
        // lastPayout: ... (add when you have payout history)
      },
    });
  } catch (err) {
    next(err);
  }
};