import Product from "../models/product.model.js";

/**
 * GET /api/products/recent
 * Returns recent products (public).
 */
export const getRecentProducts = async (req, res, next) => {
  try {
    // get query param limit? default 8
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({})
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();

    const formatted = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      image: p.image, // can be /images/... or base64
      rating: 4.5,
      price: p.price,
      originalPrice: p.originalPrice ?? p.price * 1.45,
      description: p.description || "No description",
      inStock: p.quantity > 0,
      available: p.quantity,
      category: p.category
    }));

    res.json({ success: true, products: formatted });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/category/:category
 * optional: get products by category
 */
export const getProductsByCategory = async (req, res, next) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category }).lean();
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};
