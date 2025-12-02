// api/controllers/product.controller.js
import Product from "../models/product.model.js";

// ---- PUBLIC ROUTES ----
export const getRecentProducts = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 12;
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(products);
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

    const regex = new RegExp(q, "i"); // case-insensitive match

    const products = await Product.find({
      $or: [
        { name: regex },
        { description: regex },
        { category: regex },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// ---- SELLER ONLY ROUTES ----
export const addProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, quantity } = req.body;

    if (!name || !category || !price || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Name, category, price and quantity are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    const imageUrl = `/images/${req.file.filename}`;

    const newProduct = new Product({
      name: name.trim(),
      description: description?.trim() || "",
      category: category.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      image: imageUrl,
      seller_id: req.user.id,
    });

    const savedProduct = await newProduct.save();

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

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, seller_id: req.user.id },
      {
        name: name?.trim(),
        description: description?.trim(),
        category: category?.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity),
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

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

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
