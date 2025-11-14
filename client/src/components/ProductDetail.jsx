// src/components/ProductDetail.jsx (Corrected: Dark mode classes, better image handling)
import React from "react";

export default function ProductDetail({ product, onClose }) {
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

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-4xl w-full mx-4 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>

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
            <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>

            <div className="text-xl font-semibold text-green-700 dark:text-green-400 mb-4">
              ₹{product.price.toFixed(2)}
            </div>

            <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-all">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}