// server/controllers/product.controller.js
import Product from "../models/product.model.js";

// ---- PUBLIC ----
export const getRecentProducts = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 12;
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category })
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// ---- SELLER ----
export const addProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    const imagePath = req.file?.path?.replace(/^public/, "") || "";

    if (!name || !category || !price || !quantity || !imagePath) {
      return next({ statusCode: 400, message: "All fields required" });
    }

    const product = new Product({
      name: name.trim(),
      description: description?.trim() || "",
      category: category.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      image: `/images${imagePath}`,
      seller_id: req.user.id,
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

export const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller_id: req.user.id });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getTopSales = async (req, res, next) => {
  try {
    const products = await Product.find({ seller_id: req.user.id })
      .sort({ sold: -1 })
      .limit(5);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getRecentSales = async (req, res, next) => {
  try {
    const products = await Product.find({ seller_id: req.user.id })
      .sort({ _id: -1 })
      .limit(5);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller_id: req.user.id },
      {
        name,
        description,
        category,
        price: parseFloat(price),
        quantity: parseInt(quantity),
      },
      { new: true }
    );
    if (!product) return next({ statusCode: 404, message: "Not found" });
    res.json({ message: "Updated" });
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
    if (!product) return next({ statusCode: 404, message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};