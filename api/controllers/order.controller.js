// api/controllers/order.controller.js
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { sendOtpMail } from "../utils/mailer.js";
import { errorHandler } from "../utils/error.js";

// helper: 6-digit otp
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * POST /api/orders/send-otp
 * Body: { fullName, phone, address1, address2, city, state, pincode }
 */
export const sendOrderOtp = async (req, res, next) => {
  const { fullName, phone, address1, address2, city, state, pincode } = req.body;

  try {
    if (!fullName || !phone || !address1 || !city || !state || !pincode) {
      return next(
        errorHandler(400, "Please fill all required billing fields.")
      );
    }

    // 1. Load cart with products
    // IMPORTANT: your cart schema uses "user_id", not "userId"
    const cart = await Cart.findOne({ user_id: req.user.id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return next(errorHandler(400, "Your cart is empty."));
    }

    // 2. Calculate total & copy items
    let total = 0;
    const orderItems = cart.items.map((item) => {
      const price = item.product.price;
      total += price * item.quantity;
      return {
        product: item.product._id,
        quantity: item.quantity,
        price,
      };
    });

    // 3. Get user email
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, "User not found"));

    const otp = generateOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // 4. Create order with status pending_otp
    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      totalAmount: total,
      billing: { fullName, phone, address1, address2, city, state, pincode },
      status: "pending_otp",
      otp,
      otpExpiresAt: expires,
    });

    await order.save();

    // 5. Send email
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

    // 1. Deduct stock & increase sold for each product
    for (const item of order.items) {
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

    // 2. Clear cart (again, use user_id)
    const cart = await Cart.findOne({ user_id: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // 3. Mark order as confirmed & remove otp info
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
