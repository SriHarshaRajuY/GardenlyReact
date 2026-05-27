import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/product.model.js", () => {
  const Product = jest.fn(function Product(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue({ _id: "saved-product", ...data });
  });

  Product.countDocuments = jest.fn();
  Product.find = jest.fn();
  Product.findOneAndUpdate = jest.fn();
  Product.findOneAndDelete = jest.fn();

  return { default: Product };
});

jest.unstable_mockModule("../models/cart.model.js", () => ({
  default: {
    updateMany: jest.fn(),
  },
}));

jest.unstable_mockModule("../utils/cache.js", () => ({
  clearCache: jest.fn().mockResolvedValue(undefined),
}));

describe("Product Controller Unit Tests", () => {
  let req;
  let res;
  let next;
  let productController;
  let Product;
  let Cart;
  let cache;

  beforeAll(async () => {
    productController = await import("../controllers/product.controller.js");
    Product = (await import("../models/product.model.js")).default;
    Cart = (await import("../models/cart.model.js")).default;
    cache = await import("../utils/cache.js");
  });

  beforeEach(() => {
    req = { query: {}, params: {}, body: {}, user: { id: "seller-1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getRecentProducts", () => {
    it("fetches paginated products successfully", async () => {
      const mockProducts = [{ _id: "1", name: "Test Plant" }];
      Product.countDocuments.mockResolvedValue(10);
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProducts),
      });

      await productController.getRecentProducts(req, res, next);

      expect(Product.countDocuments).toHaveBeenCalledWith();
      expect(Product.find).toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        products: mockProducts,
        currentPage: 1,
        totalPages: 1,
        totalProducts: 10,
      });
    });

    it("caps page size and calculates skip from query params", async () => {
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue([]);
      req.query = { page: "3", limit: "1000" };
      Product.countDocuments.mockResolvedValue(200);
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip,
        limit,
      });

      await productController.getRecentProducts(req, res, next);

      expect(skip).toHaveBeenCalledWith(96);
      expect(limit).toHaveBeenCalledWith(48);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        currentPage: 3,
        totalPages: 5,
      }));
    });

    it("passes database failures to error middleware", async () => {
      const error = new Error("Database Error");
      Product.countDocuments.mockRejectedValue(error);

      await productController.getRecentProducts(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("searchProducts", () => {
    it("returns 400 if query is missing", async () => {
      req.query.q = "";

      await productController.searchProducts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Search query (q) is required",
      });
    });

    it("searches products through the weighted MongoDB text index", async () => {
      req.query.q = "Aloe";
      const products = [{ _id: "1", name: "Aloe Vera" }];
      Product.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue(products),
      });

      await productController.searchProducts(req, res, next);

      expect(Product.find).toHaveBeenCalledWith({ $text: { $search: "Aloe" } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        products,
      });
    });
  });

  describe("getProductsByCategory", () => {
    it("rejects unsupported categories", async () => {
      req.params.category = "Tools";

      await productController.getProductsByCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: expect.stringContaining("Category must be one of"),
      }));
      expect(Product.find).not.toHaveBeenCalled();
    });

    it("fetches paginated products by category", async () => {
      const products = [{ _id: "p1", category: "Plants" }];
      req.params.category = "Plants";
      req.query = { page: "2", limit: "5" };
      Product.countDocuments.mockResolvedValue(12);
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(products),
      });

      await productController.getProductsByCategory(req, res, next);

      expect(Product.countDocuments).toHaveBeenCalledWith({ category: "Plants" });
      expect(Product.find).toHaveBeenCalledWith({ category: "Plants" });
      expect(res.json).toHaveBeenCalledWith({
        products,
        currentPage: 2,
        totalPages: 3,
        totalProducts: 12,
      });
    });
  });

  describe("addProduct", () => {
    it("blocks missing required fields", async () => {
      req.body = { name: "Aloe" };

      await productController.addProduct(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Name, category, price and quantity are required",
      }));
    });

    it("blocks missing product image", async () => {
      req.body = { name: "Aloe", category: "Plants", price: "199", quantity: "5" };

      await productController.addProduct(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Product image is required",
      }));
    });

    it("creates a seller-owned product and clears product caches", async () => {
      req.body = {
        name: " Aloe Vera ",
        description: " Indoor plant ",
        category: "Plants",
        price: "199",
        quantity: "5",
      };
      req.file = { path: "https://cdn.example.com/aloe.jpg" };

      await productController.addProduct(req, res, next);

      expect(Product).toHaveBeenCalledWith({
        name: "Aloe Vera",
        description: "Indoor plant",
        category: "Plants",
        price: 199,
        quantity: 5,
        image: "https://cdn.example.com/aloe.jpg",
        seller_id: "seller-1",
      });
      expect(cache.clearCache).toHaveBeenCalledWith("products");
      expect(cache.clearCache).toHaveBeenCalledWith("cart");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        product: expect.objectContaining({ name: "Aloe Vera" }),
      }));
    });
  });

  describe("updateProduct", () => {
    it("validates negative price updates", async () => {
      req.params.id = "product-1";
      req.body = { price: "-1" };

      await productController.updateProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: "Price must be greater than 0",
      }));
    });

    it("updates only products owned by the current seller", async () => {
      req.params.id = "product-1";
      req.body = { name: "Snake Plant", quantity: "8" };
      Product.findOneAndUpdate.mockResolvedValue({ _id: "product-1", name: "Snake Plant" });

      await productController.updateProduct(req, res, next);

      expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "product-1", seller_id: "seller-1" },
        { $set: { name: "Snake Plant", quantity: 8 } },
        { new: true, runValidators: true }
      );
      expect(cache.clearCache).toHaveBeenCalledWith("seller_products");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("deleteProduct", () => {
    it("removes a seller-owned product from carts and clears caches", async () => {
      req.params.id = "product-1";
      Product.findOneAndDelete.mockResolvedValue({ _id: "product-1" });
      Cart.updateMany.mockResolvedValue({ modifiedCount: 2 });

      await productController.deleteProduct(req, res, next);

      expect(Product.findOneAndDelete).toHaveBeenCalledWith({
        _id: "product-1",
        seller_id: "seller-1",
      });
      expect(Cart.updateMany).toHaveBeenCalledWith(
        { "items.product": "product-1" },
        { $pull: { items: { product: "product-1" } } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Product deleted successfully",
      });
    });

    it("returns 404 when a product is missing or not seller-owned", async () => {
      req.params.id = "product-1";
      Product.findOneAndDelete.mockResolvedValue(null);

      await productController.deleteProduct(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(Cart.updateMany).not.toHaveBeenCalled();
    });
  });
});
