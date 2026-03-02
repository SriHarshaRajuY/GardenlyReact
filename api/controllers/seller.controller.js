import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

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
            total: item.price * item.quantity,
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

    for (const order of orders) {
      for (const item of order.items) {
        if (!item.product) continue;
        if (item.product.seller_id?.toString() === sellerId) {
          totalEarnings += item.price * item.quantity;
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