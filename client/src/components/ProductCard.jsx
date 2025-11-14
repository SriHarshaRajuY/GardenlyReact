// src/components/ProductCard.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function ProductCard({ product, onOpenDetail, onEdit, onDelete }) {
  const { user } = useAuth();
  const isSeller = user?.role === "seller";

  // ---- FINAL IMAGE URL LOGIC ----
  // Works with:
  // - /images/product-123.jpg (from DB)
  // - http://... (external)
  // - fallback
  const imgSrc = product.image
    ? product.image.startsWith("http")
      ? product.image
      : product.image.startsWith("/")
      ? product.image
      : `/images/${product.image}`
    : "/images/placeholder.png";

  const handleView = () => onOpenDetail?.(product);
  const handleEdit = () => onEdit?.(product);
  const handleDelete = () => onDelete?.(product);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 duration-300 cursor-pointer">
      {/* Image */}
      <div 
        className="h-56 bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden relative"
        onClick={handleView}
      >
        <img
          src={imgSrc}
          alt={product.name}
          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.png";
          }}
          loading="lazy"
        />
        {/* Seller Actions Overlay */}
        {isSeller && (onEdit || onDelete) && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-end p-2 gap-1 opacity-0 hover:opacity-100 transition-all">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
              title="Edit"
            >
              <FaEdit size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
              title="Delete"
            >
              <FaTrash size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>

        <div className="flex justify-center items-center gap-2 mt-2">
          <span className="text-green-700 dark:text-green-400 text-lg font-bold">₹{product.price}</span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Available: {product.quantity > 0 ? `${product.quantity} in stock` : "Out of Stock"}
        </p>

        {/* Rating (if available) */}
        {product.rating && (
          <div className="flex justify-center mt-2">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={i < product.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-500"}
              >
                ★
              </span>
            ))}
          </div>
        )}

        <button 
          onClick={handleView}
          className="mt-4 bg-green-700 text-white text-sm px-4 py-2 rounded-md hover:bg-green-800 transition-all w-full"
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
}