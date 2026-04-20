// api/controllers/product.controller.js
import Product from "../models/product.model.js";
import { searchSolr, indexProduct, deleteFromSolr } from "../utils/solr.js";
import { errorHandler } from "../utils/error.js";
import { clearCache } from "../utils/cache.js";

// ---- PUBLIC ROUTES ----
export const getRecentProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

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

    // 🚀 Exact Enterprise Search using the Apache Solr Platform (WebSolr)
    let solrResults = [];
    try {
      solrResults = await searchSolr(q);
    } catch (err) {
      console.error("Solr search error:", err.message);
    }
    
    let products = [];
    if (solrResults && solrResults.length > 0) {
      // Extract IDs from Solr results
      const productIds = solrResults.map(doc => doc.id);

      // Fetch full product details from MongoDB using Solr's ranked results
      const dbProducts = await Product.find({
        _id: { $in: productIds }
      });

      // Sort products based on Solr's relevance order
      products = productIds
        .map(id => dbProducts.find(p => p._id.toString() === id))
        .filter(p => p);
    }

    // 🔄 Fallback to MongoDB Text Search if Solr returns nothing or fails
    if (products.length === 0) {
      console.log(`Solr returned 0 results for "${q}", falling back to MongoDB text search.`);
      products = await Product.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      })
      .limit(30);
    }

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

    const imageUrl = req.file.path;

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

    // 🚀 Index in Solr for instant search availability
    try {
      await indexProduct(savedProduct);
    } catch (err) {
      console.error("Failed to index new product in Solr:", err.message);
    }

    // Clear product cache
    await clearCache("products");

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

    // 🚀 Update Solr Index
    try {
      await indexProduct(updatedProduct);
    } catch (err) {
      console.error("Failed to update product in Solr:", err.message);
    }

    // Clear product cache
    await clearCache("products");

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

    // 🚀 Remove from Solr Index
    try {
      await deleteFromSolr(req.params.id);
    } catch (err) {
      console.error("Failed to delete product from Solr:", err.message);
    }

    // Clear product cache
    await clearCache("products");

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
