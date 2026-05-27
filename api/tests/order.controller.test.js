import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/order.model.js", () => ({
  default: {
    findOne: jest.fn(),
    startSession: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/cart.model.js", () => ({
  default: {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/product.model.js", () => ({
  default: {
    updateOne: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/user.model.js", () => ({
  default: {
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../utils/mailer.js", () => ({
  sendOtpMail: jest.fn(),
}));

jest.unstable_mockModule("../utils/cache.js", () => ({
  clearCache: jest.fn().mockResolvedValue(undefined),
}));

describe("Order Controller Unit Tests", () => {
  let req;
  let res;
  let next;
  let orderController;
  let Order;

  beforeAll(async () => {
    orderController = await import("../controllers/order.controller.js");
    Order = (await import("../models/order.model.js")).default;
  });

  beforeEach(() => {
    req = { user: { id: "user-1" }, params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("sendOrderOtp", () => {
    it("returns 400 if required billing fields are missing", async () => {
      req.body = { fullName: "" };

      await orderController.sendOrderOtp(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "Please fill all required billing fields.",
      }));
    });

    it("validates 10-digit phone numbers before reading the cart", async () => {
      req.body = {
        fullName: "A Buyer",
        phone: "12345",
        address1: "Main road",
        city: "Hyderabad",
        state: "TS",
        pincode: "500001",
      };

      await orderController.sendOrderOtp(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "Phone must be 10 digits.",
      }));
    });

    it("validates 6-digit pincodes before creating a pending order", async () => {
      req.body = {
        fullName: "A Buyer",
        phone: "9876543210",
        address1: "Main road",
        city: "Hyderabad",
        state: "TS",
        pincode: "500",
      };

      await orderController.sendOrderOtp(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "Pincode must be 6 digits.",
      }));
    });
  });

  describe("verifyOrderOtp", () => {
    it("returns 400 if OTP is missing", async () => {
      req.body = { orderId: "order-1" };

      await orderController.verifyOrderOtp(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "Order ID and OTP are required.",
      }));
    });

    it("returns 404 when the order does not belong to the user", async () => {
      req.body = { orderId: "order-1", otp: "123456" };
      Order.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await orderController.verifyOrderOtp(req, res, next);

      expect(Order.findOne).toHaveBeenCalledWith({
        _id: "order-1",
        userId: "user-1",
      });
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: "Order not found.",
      }));
    });

    it("rejects an already processed order", async () => {
      req.body = { orderId: "order-1", otp: "123456" };
      Order.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ status: "confirmed" }),
      });

      await orderController.verifyOrderOtp(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "OTP already used or order already processed.",
      }));
    });

    it("rejects expired OTPs", async () => {
      req.body = { orderId: "order-1", otp: "123456" };
      Order.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          status: "pending_otp",
          otp: "123456",
          otpExpiresAt: new Date(Date.now() - 1_000),
        }),
      });

      await orderController.verifyOrderOtp(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "OTP expired. Please try again.",
      }));
    });

    it("rejects incorrect OTPs", async () => {
      req.body = { orderId: "order-1", otp: "000000" };
      Order.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          status: "pending_otp",
          otp: "123456",
          otpExpiresAt: new Date(Date.now() + 60_000),
        }),
      });

      await orderController.verifyOrderOtp(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "Invalid OTP.",
      }));
    });
  });

  describe("verifyRazorpayPayment", () => {
    it("requires a complete Razorpay verification payload", async () => {
      process.env.RAZORPAY_KEY_SECRET = "secret";
      req.body = { orderId: "order-1" };

      await orderController.verifyRazorpayPayment(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "Payment verification payload is incomplete",
      }));
    });
  });
});
