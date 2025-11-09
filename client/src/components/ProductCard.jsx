import React from "react";

export default function ProductCard({ product, onOpenDetail }) {
  // ---- CORRECT IMAGE URL ----
  const imgSrc = product.image?.startsWith("http")
    ? product.image
    : product.image?.startsWith("/")
    ? `http://localhost:3000${product.image}`
    : `http://localhost:3000/images/${product.image}`;

  return (
    <div
      onClick={() => onOpenDetail?.(product)}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src={imgSrc}
          alt={product.name}
          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => (e.currentTarget.src = "http://localhost:3000/images/placeholder.png")}
        />
      </div>

      {/* Text */}
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.category}</p>

        <div className="flex justify-center items-center gap-2 mt-2">
          <span className="text-green-700 text-lg font-bold">₹{product.price}</span>
        </div>

        <p className="text-xs text-gray-500 mt-1">
          Available: {product.available > 0 ? product.available : "Out of Stock"}
        </p>

        <button className="mt-4 bg-green-700 text-white text-sm px-4 py-2 rounded-md hover:bg-green-800 transition-all w-full">
          Add To Cart
        </button>
      </div>
    </div>
  );
}