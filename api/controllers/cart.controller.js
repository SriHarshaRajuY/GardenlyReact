// api/controllers/cart.controller.js
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user_id: req.user.id }).populate(
      "items.product"
    );

    // If no cart, create an empty one for this user
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

    if (!productId)
      return next({ statusCode: 400, message: "Product ID required" });

    const product = await Product.findById(productId);
    if (!product)
      return next({ statusCode: 404, message: "Product not found" });

    // find cart for this user by user_id
    let cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) {
      cart = new Cart({ user_id: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );
    res.json(populatedCart);
  } catch (err) {
    next(err);
  }
};

// Update quantity of an item
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity == null)
      return next({
        statusCode: 400,
        message: "Product ID and quantity required",
      });
    if (quantity < 1)
      return next({
        statusCode: 400,
        message: "Quantity must be at least 1",
      });

    const cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) return next({ statusCode: 404, message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item)
      return next({ statusCode: 404, message: "Item not found in cart" });

    item.quantity = quantity;

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );
    res.json(populatedCart);
  } catch (err) {
    next(err);
  }
};

// Remove item from cart
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) return next({ statusCode: 404, message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );
    res.json(populatedCart);
  } catch (err) {
    next(err);
  }
};

// Checkout (not used in OTP flow, but fine to keep)
export const checkout = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user.id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0)
      return next({ statusCode: 400, message: "Cart is empty" });

    for (const item of cart.items) {
      const product = item.product;
      if (product.quantity < item.quantity) {
        return next({
          statusCode: 400,
          message: `Not enough stock for ${product.name}`,
        });
      }
      product.quantity -= item.quantity;
      product.sold += item.quantity;
      product.soldAt = new Date();
      await product.save();
    }

    cart.items = [];
    await cart.save();

    res.json({ message: "Checkout successful" });
  } catch (err) {
    next(err);
  }
};
