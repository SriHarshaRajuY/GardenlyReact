// api/controllers/product.controller.js
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import { errorHandler } from "../utils/error.js";
import { clearCache } from "../utils/cache.js";

const PRODUCT_CATEGORIES = ["Plants", "Seeds", "Pots"];

const clearProductCaches = async () => {
  await Promise.all([
    clearCache("products"),
    clearCache("products:category"),
    clearCache("products:search"),
    clearCache("seller_products"),
    clearCache("top_sales"),
    clearCache("recent_sales"),
    clearCache("cart"),
  ]);
};

const validateProductPayload = ({ name, category, price, quantity }, { partial = false } = {}) => {
  const update = {};

  if (!partial || name !== undefined) {
    if (!String(name || "").trim()) return { error: "Product name is required" };
    update.name = String(name).trim();
  }

  if (!partial || category !== undefined) {
    const normalizedCategory = String(category || "").trim();
    if (!PRODUCT_CATEGORIES.includes(normalizedCategory)) {
      return { error: `Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}` };
    }
    update.category = normalizedCategory;
  }

  if (!partial || price !== undefined) {
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return { error: "Price must be greater than 0" };
    }
    update.price = parsedPrice;
  }

  if (!partial || quantity !== undefined) {
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      return { error: "Quantity must be a whole number of 0 or more" };
    }
    update.quantity = parsedQuantity;
  }

  return { update };
};

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 48);
  return { page, limit, skip: (page - 1) * limit };
};

// ---- PUBLIC ROUTES ----
export const getRecentProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const total = await Product.countDocuments();
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    if (!PRODUCT_CATEGORIES.includes(category)) {
      return next(errorHandler(400, `Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}`));
    }

    const { page, limit, skip } = parsePagination(req.query);


    const total = await Product.countDocuments({ category });
    const products = await Product.find({ category })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (err) {
    next(err);
  }
};

// 🔍 SEARCH PRODUCTS (NEW)
export const searchProducts = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query (q) is required",
      });
    }

    const products = await Product.find({
      $text: { $search: q }
    }).limit(30);

    res.status(200).json({
      success: true,
      count: products.length,
      products: products,
    });
  } catch (err) {
    next(err);
  }
};

// ---- SELLER ONLY ROUTES ----
export const addProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, quantity } = req.body;

    if (!name || !category || price === undefined || price === "" || quantity === undefined || quantity === "") {
      return res.status(400).json({
        success: false,
        message: "Name, category, price and quantity are required",
      });
    }

    const { error, update } = validateProductPayload({ name, category, price, quantity });
    if (error) return next(errorHandler(400, error));

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    const imageUrl = req.file.path;

    const newProduct = new Product({
      name: update.name,
      description: description?.trim() || "",
      category: update.category,
      price: update.price,
      quantity: update.quantity,
      image: imageUrl,
      seller_id: req.user.id,
    });

    const savedProduct = await newProduct.save();

    await clearProductCaches();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: savedProduct,
    });
  } catch (err) {
    console.error("Add Product Error:", err);
    next(err);
  }
};

export const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller_id: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

export const getTopSales = async (req, res, next) => {
  try {
    const products = await Product.find({ seller_id: req.user.id })
      .sort({ sold: -1 })
      .limit(5);
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

export const getRecentSales = async (req, res, next) => {
  try {
    const products = await Product.find({ seller_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    const { error, update } = validateProductPayload(
      { name, category, price, quantity },
      { partial: true }
    );

    if (error) return next(errorHandler(400, error));
    if (description !== undefined) update.description = description?.trim() || "";
    if (Object.keys(update).length === 0) {
      return next(errorHandler(400, "No product fields provided"));
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, seller_id: req.user.id },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await clearProductCaches();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller_id: req.user.id,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await Cart.updateMany(
      { "items.product": req.params.id },
      { $pull: { items: { product: req.params.id } } }
    );
    await clearProductCaches();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
