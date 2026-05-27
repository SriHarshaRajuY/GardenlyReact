import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/user.model.js", () => ({
  default: {
    findById: jest.fn().mockReturnThis(),
    select: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/order.model.js", () => ({
  default: {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn(),
  },
}));

describe("User Controller Unit Tests", () => {
  let req;
  let res;
  let next;
  let userController;
  let User;
  let Order;

  beforeAll(async () => {
    userController = await import("../controllers/user.controller.js");
    User = (await import("../models/user.model.js")).default;
    Order = (await import("../models/order.model.js")).default;
  });

  beforeEach(() => {
    req = { user: { id: "user123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("returns user profile and order stats successfully", async () => {
      const mockUser = { id: "user123", username: "testuser" };
      User.select.mockResolvedValue(mockUser);
      const mockOrders = [
        { status: "confirmed", totalAmount: 100 },
        { status: "cancelled", totalAmount: 50 },
        { status: "pending_otp", totalAmount: 30 },
      ];
      Order.populate.mockResolvedValue(mockOrders);

      await userController.getProfile(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(User.select).toHaveBeenCalledWith("-password -resetOtp -resetOtpExpiresAt");
      expect(Order.find).toHaveBeenCalledWith({ userId: "user123" });
      expect(Order.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(Order.populate).toHaveBeenCalledWith("items.product", "name image price");
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        user: mockUser,
        stats: {
          totalOrders: 3,
          confirmedOrders: 1,
          cancelledOrders: 1,
          pendingOrders: 1,
          totalSpent: 100,
        },
        orders: mockOrders,
      }));
    });

    it("calculates totals from confirmed orders only", async () => {
      User.select.mockResolvedValue({ id: "user123" });
      Order.populate.mockResolvedValue([
        { status: "confirmed", totalAmount: 125 },
        { status: "confirmed", totalAmount: 75 },
        { status: "pending_payment", totalAmount: 999 },
        { status: "cancelled", totalAmount: 300 },
      ]);

      await userController.getProfile(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        stats: expect.objectContaining({
          totalOrders: 4,
          confirmedOrders: 2,
          cancelledOrders: 1,
          pendingOrders: 0,
          totalSpent: 200,
        }),
      }));
    });

    it("handles users with zero orders", async () => {
      User.select.mockResolvedValue({ id: "user123" });
      Order.populate.mockResolvedValue([]);

      await userController.getProfile(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        stats: {
          totalOrders: 0,
          confirmedOrders: 0,
          cancelledOrders: 0,
          pendingOrders: 0,
          totalSpent: 0,
        },
        orders: [],
      }));
    });

    it("returns 404 if user is not found", async () => {
      User.select.mockResolvedValue(null);

      await userController.getProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: "User not found",
      }));
      expect(Order.find).not.toHaveBeenCalled();
    });

    it("passes database errors to error middleware", async () => {
      const error = new Error("DB Error");
      User.select.mockRejectedValue(error);

      await userController.getProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
