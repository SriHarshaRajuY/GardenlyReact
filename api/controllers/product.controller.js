import Product from "../models/product.model.js";

/**
 * GET /api/products/recent
 * Returns recent products (public endpoint)
 */
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
      image: p.image?.startsWith("/images")
        ? `http://localhost:3000${p.image}`
        : p.image,
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

/**
 * GET /api/products/category/:category
 * Returns products filtered by category
 */
export const getProductsByCategory = async (req, res, next) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category })
      .sort({ created_at: -1 })
      .lean();

    const formatted = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      image: p.image?.startsWith("/images")
        ? `http://localhost:3000${p.image}`
        : p.image,
      price: p.price,
      category: p.category,
    }));

    res.json({ success: true, products: formatted });
  } catch (err) {
    next(err);
  }
};
