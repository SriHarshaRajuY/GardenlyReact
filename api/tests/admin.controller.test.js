import { jest } from "@jest/globals";

const makeListChain = (value = []) => ({
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  select: jest.fn().mockResolvedValue(value),
});

jest.unstable_mockModule("../models/user.model.js", () => ({
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/product.model.js", () => ({
  default: {
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/order.model.js", () => ({
  default: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/ticket.model.js", () => ({
  default: {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/blog.model.js", () => ({
  default: {
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/community.model.js", () => ({
  default: {
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/communityPost.model.js", () => ({
  default: {
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/customRequest.model.js", () => ({
  default: {
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/cart.model.js", () => ({
  default: {
    deleteOne: jest.fn(),
    updateMany: jest.fn(),
  },
}));

jest.unstable_mockModule("../utils/cache.js", () => ({
  clearCache: jest.fn().mockResolvedValue(undefined),
}));

describe("Admin Controller Unit Tests", () => {
  let req;
  let res;
  let next;
  let adminController;
  let User;
  let Product;
  let Order;
  let Ticket;
  let Cart;
  let cache;

  beforeAll(async () => {
    adminController = await import("../controllers/admin.controller.js");
    User = (await import("../models/user.model.js")).default;
    Product = (await import("../models/product.model.js")).default;
    Order = (await import("../models/order.model.js")).default;
    Ticket = (await import("../models/ticket.model.js")).default;
    Cart = (await import("../models/cart.model.js")).default;
    cache = await import("../utils/cache.js");
  });

  beforeEach(() => {
    req = { query: {}, params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();

    User.countDocuments.mockResolvedValue(10);
    Product.countDocuments.mockResolvedValue(20);
    Order.countDocuments.mockResolvedValue(30);
    Ticket.countDocuments.mockResolvedValue(40);
    Order.aggregate.mockResolvedValue([{ total: 1000 }]);

    Order.find.mockReturnValue(makeListChain());
    Product.find.mockReturnValue(makeListChain());
    User.find.mockReturnValue(makeListChain());
  });

  describe("getAdminDashboard", () => {
    it("returns aggregated stats for the admin dashboard", async () => {
      await adminController.getAdminDashboard(req, res, next);

      expect(User.countDocuments).toHaveBeenCalledWith({ role: "Buyer" });
      expect(Order.aggregate).toHaveBeenCalledWith([
        { $match: { status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$totalAdminCommission" } } },
      ]);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        stats: expect.objectContaining({
          users: expect.objectContaining({ total: 10, buyers: 10 }),
          products: { total: 20 },
          orders: expect.objectContaining({ total: 30, revenue: 1000 }),
        }),
      }));
    });

    it("normalizes dashboard failures through error middleware", async () => {
      User.countDocuments.mockRejectedValue(new Error("db down"));

      await adminController.getAdminDashboard(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 500,
        message: "Failed to load admin dashboard stats",
      }));
    });
  });

  describe("getAllUsers", () => {
    it("fetches all users without sensitive auth fields", async () => {
      const users = [{ username: "user1" }];
      const sort = jest.fn().mockResolvedValue(users);
      const select = jest.fn().mockReturnValue({ sort });
      User.find.mockReturnValue({ select });

      await adminController.getAllUsers(req, res, next);

      expect(User.find).toHaveBeenCalledWith({});
      expect(select).toHaveBeenCalledWith("-password -resetOtp -resetOtpExpiresAt -emailVerificationOtp -twoFactorOtp");
      expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        users,
      });
    });
  });

  describe("product and ticket management", () => {
    it("deletes a product and removes it from carts", async () => {
      req.params.id = "product-1";
      Product.findByIdAndDelete.mockResolvedValue({ _id: "product-1" });
      Cart.updateMany.mockResolvedValue({ modifiedCount: 2 });

      await adminController.deleteProduct(req, res, next);

      expect(Product.findByIdAndDelete).toHaveBeenCalledWith("product-1");
      expect(Cart.updateMany).toHaveBeenCalledWith(
        { "items.product": "product-1" },
        { $pull: { items: { product: "product-1" } } }
      );
      expect(cache.clearCache).toHaveBeenCalledWith("products");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Product deleted successfully",
      });
    });

    it("returns 404 when an admin tries to delete a missing product", async () => {
      req.params.id = "missing-product";
      Product.findByIdAndDelete.mockResolvedValue(null);

      await adminController.deleteProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: "Product not found",
      }));
      expect(Cart.updateMany).not.toHaveBeenCalled();
    });

    it("requires a resolution note before resolving a ticket", async () => {
      req.body = { resolution: "   " };

      await adminController.resolveTicket(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "Resolution note is required",
      }));
      expect(Ticket.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("resolves a ticket with a trimmed resolution note", async () => {
      req.params.id = "ticket-1";
      req.body = { resolution: "  Replaced damaged plant  " };
      const ticket = { _id: "ticket-1", status: "Resolved" };
      Ticket.findByIdAndUpdate.mockResolvedValue(ticket);

      await adminController.resolveTicket(req, res, next);

      expect(Ticket.findByIdAndUpdate).toHaveBeenCalledWith(
        "ticket-1",
        { status: "Resolved", resolution: "Replaced damaged plant" },
        { new: true }
      );
      expect(cache.clearCache).toHaveBeenCalledWith("ticket");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Ticket resolved",
        ticket,
      });
    });
  });
});
