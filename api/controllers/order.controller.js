// api/controllers/order.controller.js
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { sendOtpMail } from "../utils/mailer.js";
import { errorHandler } from "../utils/error.js";

// Helper: generate 6-digit OTP as string
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * POST /api/orders/send-otp
 * Body: { fullName, phone, address1, address2, city, state, pincode }
 */
export const sendOrderOtp = async (req, res, next) => {
  const { fullName, phone, address1, address2, city, state, pincode } =
    req.body;

  try {
    // Basic billing validation
    if (!fullName || !phone || !address1 || !city || !state || !pincode) {
      return next(
        errorHandler(400, "Please fill all required billing fields.")
      );
    }

    // 1. Load cart with populated products
    const cart = await Cart.findOne({ user_id: req.user.id }).populate(
      "items.product"
    );

    if (!cart || !cart.items || cart.items.length === 0) {
      return next(errorHandler(400, "Your cart is empty."));
    }

    // 2. Remove items where product is null (product deleted from DB)
    const items = cart.items.filter((i) => i.product !== null);

    if (items.length === 0) {
      // Clean the cart in DB so this doesn't keep happening
      cart.items = [];
      await cart.save();
      return next(
        errorHandler(
          400,
          "Products in your cart are no longer available. Please add products again."
        )
      );
    }

    // If we removed some invalid items, persist the cleaned list
    if (items.length !== cart.items.length) {
      cart.items = items.map((i) => ({
        product: i.product._id,
        quantity: i.quantity,
      }));
      await cart.save();
    }

    // 3. Build orderItems and total
    let total = 0;
    const orderItems = items.map((item) => {
      const price = item.product.price ?? 0;
      total += price * item.quantity;
      return {
        product: item.product._id,
        quantity: item.quantity,
        price,
      };
    });

    if (total <= 0) {
      return next(
        errorHandler(
          400,
          "Order amount is invalid. Please check your cart and try again."
        )
      );
    }

    // 4. Get user (for email)
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, "User not found."));

    const otp = generateOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 5. Create order with pending_otp status
    const order = new Order({
      userId: user._id,
      items: orderItems,
      totalAmount: total,
      billing: { fullName, phone, address1, address2, city, state, pincode },
      status: "pending_otp",
      otp,
      otpExpiresAt: expires,
    });

    await order.save();

    // 6. Send OTP mail
    await sendOtpMail(user.email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email.",
      orderId: order._id,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/orders/verify-otp
 * Body: { orderId, otp }
 */
export const verifyOrderOtp = async (req, res, next) => {
  const { orderId, otp } = req.body;

  try {
    if (!orderId || !otp) {
      return next(errorHandler(400, "Order ID and OTP are required."));
    }

    // Load order with products
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id,
    }).populate("items.product");

    if (!order) return next(errorHandler(404, "Order not found."));
    if (order.status !== "pending_otp") {
      return next(
        errorHandler(400, "OTP already used or order already processed.")
      );
    }

    if (!order.otp || order.otp !== otp) {
      return next(errorHandler(400, "Invalid OTP."));
    }

    if (order.otpExpiresAt && order.otpExpiresAt < new Date()) {
      return next(errorHandler(400, "OTP expired. Please try again."));
    }

    // 1. For each order item, update stock & sold
    for (const item of order.items) {
      // If product was deleted after order creation, just skip that item
      if (!item.product) continue;

      const product = await Product.findById(item.product._id);
      if (!product) continue;

      if (product.quantity < item.quantity) {
        return next(
          errorHandler(
            400,
            `Not enough stock for ${product.name}. Available: ${product.quantity}`
          )
        );
      }

      product.quantity -= item.quantity;
      product.sold = (product.sold || 0) + item.quantity;
      product.soldAt = new Date();
      await product.save();
    }

    // 2. Clear the user's cart
    const cart = await Cart.findOne({ user_id: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // 3. Mark order as confirmed
    order.status = "confirmed";
    order.otp = undefined;
    order.otpExpiresAt = undefined;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order placed successfully!",
      orderId: order._id,
    });
  } catch (err) {
    next(err);
  }
};
