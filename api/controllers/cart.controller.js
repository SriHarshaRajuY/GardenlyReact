// api/controllers/cart.controller.js
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { clearCache } from "../utils/cache.js";

const clearCartCaches = async () => {
  await Promise.all([clearCache("cart"), clearCache("user_profile")]);
};

// Get cart for logged-in buyer
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user_id: req.user.id }).populate(
      "items.product"
    );

    if (!cart) {
      cart = new Cart({ user_id: req.user.id, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// Add item to cart
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const parsedQuantity = Number(quantity);

    if (!productId)
      return next({ statusCode: 400, message: "Product ID required" });
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return next({ statusCode: 400, message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product)
      return next({ statusCode: 404, message: "Product not found" });

    let cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) {
      cart = new Cart({ user_id: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += parsedQuantity;
    } else {
      cart.items.push({ product: productId, quantity: parsedQuantity });
    }

    const requestedQuantity = existingItem?.quantity || parsedQuantity;
    if (requestedQuantity > product.quantity) {
      return next({
        statusCode: 400,
        message: `Only ${product.quantity} items are available in stock`,
      });
    }

    await cart.save();
    await clearCartCaches();
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );
    res.json(populatedCart);
  } catch (err) {
    next(err);
  }
};

// Update quantity
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const parsedQuantity = Number(quantity);

    if (!productId || quantity == null)
      return next({
        statusCode: 400,
        message: "Product ID and quantity required",
      });
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1)
      return next({
        statusCode: 400,
        message: "Quantity must be at least 1",
      });

    const product = await Product.findById(productId);
    if (!product) return next({ statusCode: 404, message: "Product not found" });
    if (parsedQuantity > product.quantity) {
      return next({
        statusCode: 400,
        message: `Only ${product.quantity} items are available in stock`,
      });
    }

    const cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) return next({ statusCode: 404, message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item)
      return next({ statusCode: 404, message: "Item not found in cart" });

    item.quantity = parsedQuantity;

    await cart.save();
    await clearCartCaches();
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );
    res.json(populatedCart);
  } catch (err) {
    next(err);
  }
};

// Remove item
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) return next({ statusCode: 404, message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    await clearCartCaches();
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );
    res.json(populatedCart);
  } catch (err) {
    next(err);
  }
};
