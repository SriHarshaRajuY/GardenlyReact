// api/controllers/order.controller.js
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { sendOtpMail } from "../utils/mailer.js";
import { errorHandler } from "../utils/error.js";
import razorpay from "../utils/razorpay.js";
import crypto from "crypto";


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

    // 2. Remove items where product is null
    const items = cart.items.filter((i) => i.product !== null);

    if (items.length === 0) {
      cart.items = [];
      await cart.save();
      return next(
        errorHandler(
          400,
          "Products in your cart are no longer available. Please add products again."
        )
      );
    }

    // Clean cart if needed
    if (items.length !== cart.items.length) {
      cart.items = items.map((i) => ({
        product: i.product._id,
        quantity: i.quantity,
      }));
      await cart.save();
    }

    // ============================
    // BUILD ORDER + REVENUE LOGIC
    // ============================
    let total = 0;
    let totalAdminCommission = 0;

    const orderItems = items.map((item) => {
      const price = item.product.price ?? 0;
      const quantity = item.quantity;

      const itemTotal = price * quantity;

      // 10% commission to Gardenly
      const adminCommission = Math.round(itemTotal * 0.10);

      // 90% to seller
      const sellerEarning = itemTotal - adminCommission;

      total += itemTotal;
      totalAdminCommission += adminCommission;

      return {
        product: item.product._id,
        sellerId: item.product.seller_id,
        quantity,
        price,
        adminCommission,
        sellerEarning,
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
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // 5. Create order
    const order = new Order({
      userId: user._id,
      items: orderItems,
      totalAmount: total,
      totalAdminCommission,
      billing: { fullName, phone, address1, address2, city, state, pincode },
      status: "pending_otp",
      otp,
      otpExpiresAt: expires,
    });

    await order.save();

    // 6. Send OTP
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

    if (order.otpExpiresAt && order.otpExpiresAt < new Date() && otp !== "PAYMENT_DONE") {
      return next(errorHandler(400, "OTP expired. Please try again."));
    }

    if (otp === "PAYMENT_DONE") {
      // Payment already verified via Razorpay
      order.paymentId = req.body.paymentId;
      order.paymentMethod = "razorpay";
    } else {
      if (!order.otp || order.otp !== otp) {
        return next(errorHandler(400, "Invalid OTP."));
      }
      order.paymentMethod = "cod";
    }

    // Update stock
    for (const item of order.items) {
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

    // Clear cart
    const cart = await Cart.findOne({ user_id: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // Confirm order
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

/**
 * POST /api/orders/razorpay

 * Create a Razorpay Order
 */
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount) return next(errorHandler(400, "Amount is required"));

    const options = {
      amount: amount * 100, // Razorpay works in paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/orders/razorpay/verify
 * Verify Razorpay Payment
 */
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return next(errorHandler(400, "Invalid payment signature"));
    }
  } catch (err) {
    next(err);
  }
};
