import React from "react";

export default function ProductDetail({ product, onClose }) {
  if (!product) return null;

  const imgSrc = product.image && product.image.startsWith("data:")
    ? product.image
    : (product.image?.startsWith("/") ? product.image : `/images/${product.image?.replace(/^\.?\/?public\/images\/?/,'')}` );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">✕</button>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <img src={imgSrc} alt={product.name} className="w-full h-64 object-contain" />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-gray-600 mt-2">{product.description}</p>
            <div className="mt-4 text-xl font-semibold text-green-700">${product.price.toFixed(2)}</div>
            <div className="mt-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
