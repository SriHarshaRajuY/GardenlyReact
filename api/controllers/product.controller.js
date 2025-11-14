// api/controllers/product.controller.js
import Product from "../models/product.model.js";

const API_URL = "http://localhost:3000";

// Helper: Format image URL
const formatImage = (img) => {
  if (!img) return null;
  if (img.startsWith("data:")) return img; // base64
  if (img.startsWith("/images")) return `${API_URL}${img}`;
  return img;
};

// GET /api/products/recent
export const getRecentProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({})
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();

    const formatted = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      image: formatImage(p.image),
      price: p.price,
      originalPrice: p.originalPrice ?? p.price * 1.45,
      description: p.description || "No description available",
      category: p.category,
      available: p.quantity,
      inStock: p.quantity > 0,
    }));

    res.json({ success: true, products: formatted });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/category/:category
export const getProductsByCategory = async (req, res, next) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category })
      .sort({ created_at: -1 })
      .lean();

    const formatted = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      image: formatImage(p.image),
      price: p.price,
      category: p.category,
    }));

    res.json({ success: true, products: formatted });
  } catch (err) {
    next(err);
  }
};

// POST /api/products (seller add)
export const addProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    const imageFile = req.file;

    if (!name || !imageFile || !category || !price || !quantity) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const priceNum = parseFloat(price);
    const quantityNum = parseInt(quantity);
    if (isNaN(priceNum) || priceNum <= 0 || isNaN(quantityNum) || quantityNum <= 0) {
      return res.status(400).json({ success: false, message: "Invalid price or quantity" });
    }

    const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;

    const product = new Product({
      name,
      description,
      category,
      price: priceNum,
      quantity: quantityNum,
      image: base64Image,
      seller_id: req.session.user._id,
      sold: 0,
    });

    const saved = await product.save();

    res.json({
      success: true,
      product: {
        id: saved._id.toString(),
        name: saved.name,
        price: saved.price,
        quantity: saved.quantity,
        image: saved.image,
        description: saved.description,
        category: saved.category,
        sold: saved.sold,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
export const editProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    const productId = req.params.id;

    const priceNum = parseFloat(price);
    const quantityNum = parseInt(quantity);
    if (!name || !category || isNaN(priceNum) || priceNum <= 0 || isNaN(quantityNum) || quantityNum < 0) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const updated = await Product.findOneAndUpdate(
      { _id: productId, seller_id: req.session.user._id },
      { name, description, category, price: priceNum, quantity: quantityNum },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found or not owned" });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findOneAndDelete({
      _id: req.params.id,
      seller_id: req.session.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found or not owned" });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/seller
export const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller_id: req.session.user._id }).lean();
    const formatted = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      image: formatImage(p.image),
      price: p.price,
      quantity: p.quantity,
      sold: p.sold,
      description: p.description || "No description",
      category: p.category || "Uncategorized",
    }));
    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/top-sales
export const getTopSales = async (req, res, next) => {
  try {
    const products = await Product.find({ seller_id: req.session.user._id })
      .sort({ sold: -1 })
      .limit(5)
      .lean();

    const formatted = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      image: formatImage(p.image),
      price: p.price,
      quantity: p.quantity,
      sold: p.sold,
      description: p.description || "No description",
      category: p.category || "Uncategorized",
    }));
    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/recent-sales
export const getRecentSales = async (req, res, next) => {
  try {
    const products = await Product.find({ seller_id: req.session.user._id })
      .sort({ created_at: -1 })
      .limit(5)
      .lean();

    const formatted = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      image: formatImage(p.image),
      price: p.price,
      quantity: p.quantity,
      sold: p.sold,
      description: p.description || "No description",
      category: p.category || "Uncategorized",
    }));
    res.json(formatted);
  } catch (err) {
    next(err);
  }
};