
import React from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, checkout } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "buyer") {
    navigate("/signin");
    return null;
  }

  if (!cart) return <p className="text-center py-20">Loading cart...</p>;

  if (cart.items.length === 0) return <p className="text-center py-20 text-gray-600 dark:text-gray-400">Your cart is empty.</p>;

  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleQuantity = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty > 0) {
      updateQuantity(item.product._id, newQty);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">Your Cart</h1>
        <div className="space-y-6">
          {cart.items.map((item) => (
            <div key={item.product._id} className="flex items-center gap-4 border-b pb-4 dark:border-gray-700">
              <img
                src={item.product.image || "/images/placeholder.png"}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{item.product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.product.category}</p>
                <p className="text-green-700 dark:text-green-400 font-medium">₹{item.product.price} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantity(item, -1)}
                  className="p-1 bg-gray-200 dark:bg-gray-700 rounded"
                  disabled={item.quantity <= 1}
                >
                  <FaMinus />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleQuantity(item, 1)}
                  className="p-1 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  <FaPlus />
                </button>
              </div>
              <p className="w-24 text-right font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeFromCart(item.product._id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Total: ₹{total.toFixed(2)}</h2>
          <button
            onClick={checkout}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}