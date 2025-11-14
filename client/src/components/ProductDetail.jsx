// src/components/ProductDetail.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

export default function ProductDetail({ product, onClose }) {
  const { user } = useAuth();
  const isSeller = user?.role === "seller";

  if (!product) return null;

  // ---- FINAL IMAGE URL LOGIC ----
  const imgSrc = product.image
    ? product.image.startsWith("data:")
      ? product.image
      : product.image.startsWith("http")
        ? product.image
        : product.image.startsWith("/")
          ? product.image
          : `/images/${product.image.replace(/^\.?\/?public\/images\/?/, "")}`
    : "/images/placeholder.png";

  const handleEdit = () => {
    onClose();
    // Trigger edit from parent if passed
  };

  const handleDelete = () => {
    if (confirm("Delete this product?")) {
      // Trigger delete from parent if passed
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-4xl w-full mx-4 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {isSeller && (
          <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={handleEdit}
              className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
              title="Edit Product"
            >
              <FaEdit />
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
              title="Delete Product"
            >
              <FaTrash />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          <div className="md:w-1/2 bg-gray-50 dark:bg-gray-700 rounded-md p-4 flex items-center justify-center">
            <img
              src={imgSrc}
              alt={product.name}
              className="max-h-96 object-contain"
              onError={(e) => (e.currentTarget.src = "/images/placeholder.png")}
            />
          </div>

          {/* Details */}
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {product.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description || "No description available."}</p>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Category: {product.category}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Available: {product.quantity}</p>
              {product.sold && <p className="text-sm text-gray-500 dark:text-gray-400">Sold: {product.sold}</p>}
            </div>

            <div className="text-xl font-semibold text-green-700 dark:text-green-400 mb-4">
              ₹{product.price.toFixed(2)}
            </div>

            <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-all w-full mb-4">
              Add to Cart
            </button>

            {/* Additional seller info */}
            {isSeller && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Your Product ID: {product._id}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}