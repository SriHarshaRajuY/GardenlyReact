import Product from "../models/product.model.js";

// GET RECENT PRODUCTS
export const getRecentProducts = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 12;
    const products = await Product.find().sort({ createdAt: -1 }).limit(limit);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET BY CATEGORY
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// ADD PRODUCT
export const addProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    const imagePath = req.file?.path?.replace(/^public/, "") || "";

    if (!name || !category || !price || !quantity || !imagePath) {
      return next({ statusCode: 400, message: "All fields are required" });
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

// GET SELLER PRODUCTS
export const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller_id: req.user.id });
    res.json(products);
  } catch (err) {
    next(err);
  }
};