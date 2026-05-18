// api/controllers/order.controller.js
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { sendOtpMail } from "../utils/mailer.js";
import { errorHandler } from "../utils/error.js";
import razorpay from "../utils/razorpay.js";
import { clearCache } from "../utils/cache.js";
import crypto from "crypto";


// Helper: generate 6-digit OTP as string
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const validateBilling = ({ fullName, phone, address1, city, state, pincode }) => {
  if (!fullName || !phone || !address1 || !city || !state || !pincode) {
    return "Please fill all required billing fields.";
  }

  if (!/^\d{10}$/.test(String(phone))) {
    return "Phone must be 10 digits.";
  }

  if (!/^\d{6}$/.test(String(pincode))) {
    return "Pincode must be 6 digits.";
  }

  return null;
};

const buildOrderFromCart = async (userId, billing) => {
  const cart = await Cart.findOne({ user_id: userId }).populate("items.product");

  if (!cart || !cart.items || cart.items.length === 0) {
    throw errorHandler(400, "Your cart is empty.");
  }

  const items = cart.items.filter((i) => i.product !== null);

  if (items.length === 0) {
    cart.items = [];
    await cart.save();
    throw errorHandler(
      400,
      "Products in your cart are no longer available. Please add products again."
    );
  }

  if (items.length !== cart.items.length) {
    cart.items = items.map((i) => ({
      product: i.product._id,
      quantity: i.quantity,
    }));
    await cart.save();
  }

  let total = 0;
  let totalAdminCommission = 0;

  const orderItems = items.map((item) => {
    const price = item.product.price ?? 0;
    const quantity = item.quantity;
    const itemTotal = price * quantity;
    const adminCommission = Math.round(itemTotal * 0.10);
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
    throw errorHandler(400, "Order amount is invalid. Please check your cart and try again.");
  }

  return {
    cart,
    orderItems,
    total,
    totalAdminCommission,
    billing,
  };
};

const confirmOrderWithStock = async ({ order, userId, paymentMethod, paymentId }) => {
  const session = await Order.startSession();

  try {
    await session.withTransaction(async () => {
      const freshOrder = await Order.findOne({
        _id: order._id,
        userId,
        status: order.status,
      }).session(session);

      if (!freshOrder) {
        throw errorHandler(404, "Order not found or already processed.");
      }

      for (const item of freshOrder.items) {
        const productUpdate = await Product.updateOne(
          { _id: item.product, quantity: { $gte: item.quantity } },
          {
            $inc: { quantity: -item.quantity, sold: item.quantity },
            $set: { soldAt: new Date() },
          },
          { session }
        );

        if (productUpdate.modifiedCount !== 1) {
          const product = await Product.findById(item.product).session(session);
          throw errorHandler(
            400,
            `Not enough stock for ${product?.name || "one of the products"}.`
          );
        }
      }

      await Cart.updateOne(
        { user_id: userId },
        { $set: { items: [] } },
        { session }
      );

      freshOrder.status = "confirmed";
      freshOrder.paymentMethod = paymentMethod;
      freshOrder.paymentId = paymentId;
      freshOrder.otp = undefined;
      freshOrder.otpExpiresAt = undefined;
      await freshOrder.save({ session });
    });

    await Promise.all([
      clearCache("cart"),
      clearCache("user_profile"),
      clearCache("seller_orders"),
      clearCache("seller_summary"),
      clearCache("seller_products"),
      clearCache("products"),
      clearCache("products:category"),
      clearCache("products:search"),
      clearCache("top_sales"),
      clearCache("recent_sales"),
    ]);
  } finally {
    await session.endSession();
  }
};

/**
 * POST /api/orders/send-otp
 * Body: { fullName, phone, address1, address2, city, state, pincode }
 */
export const sendOrderOtp = async (req, res, next) => {
  const { fullName, phone, address1, address2, city, state, pincode } = req.body;

  try {
    const billingError = validateBilling({ fullName, phone, address1, city, state, pincode });
    if (billingError) return next(errorHandler(400, billingError));

    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, "User not found."));

    const { orderItems, total, totalAdminCommission } = await buildOrderFromCart(req.user.id, {
      fullName,
      phone,
      address1,
      address2,
      city,
      state,
      pincode,
    });

    const otp = generateOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

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

    if (order.otpExpiresAt && order.otpExpiresAt < new Date()) {
      return next(errorHandler(400, "OTP expired. Please try again."));
    }

    if (!order.otp || order.otp !== otp) {
      return next(errorHandler(400, "Invalid OTP."));
    }

    await confirmOrderWithStock({
      order,
      userId: req.user.id,
      paymentMethod: "cod",
      paymentId: undefined,
    });

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
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return next(errorHandler(500, "Razorpay is not configured."));
    }

    const { fullName, phone, address1, address2, city, state, pincode } = req.body;
    const billingError = validateBilling({ fullName, phone, address1, city, state, pincode });
    if (billingError) return next(errorHandler(400, billingError));

    const { orderItems, total, totalAdminCommission } = await buildOrderFromCart(req.user.id, {
      fullName,
      phone,
      address1,
      address2,
      city,
      state,
      pincode,
    });

    const options = {
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    const pendingOrder = await Order.create({
      userId: req.user.id,
      items: orderItems,
      totalAmount: total,
      totalAdminCommission,
      billing: { fullName, phone, address1, address2, city, state, pincode },
      status: "pending_payment",
      paymentMethod: "razorpay",
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(200).json({
      success: true,
      orderId: pendingOrder._id,
      amount: total,
      razorpayOrder,
    });
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
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return next(errorHandler(500, "Razorpay is not configured."));
    }

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(errorHandler(400, "Payment verification payload is incomplete"));
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id,
      status: "pending_payment",
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) return next(errorHandler(404, "Pending payment order not found"));

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const signatureBuffer = Buffer.from(razorpay_signature);
    const expectedBuffer = Buffer.from(expectedSign);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return next(errorHandler(400, "Invalid payment signature"));
    }

    await confirmOrderWithStock({
      order,
      userId: req.user.id,
      paymentMethod: "razorpay",
      paymentId: razorpay_payment_id,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      orderId: order._id,
    });
  } catch (err) {
    next(err);
  }
};

