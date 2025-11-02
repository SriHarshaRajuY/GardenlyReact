import React from "react";

export default function ProductCard({ product, onOpenDetail }) {
  // product.image may be absolute or relative path
  const imgSrc = product.image && product.image.startsWith("data:")
    ? product.image
    : (product.image?.startsWith("/") ? product.image : `/images/${product.image?.replace(/^\.?\/?public\/images\/?/,'')}` );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="relative">
        <img src={imgSrc} alt={product.name} className="mx-auto h-44 object-contain" />
        <div className="absolute top-2 right-2 flex gap-2">
          <button title="Wishlist" className="p-2 rounded bg-white/80">♡</button>
          <button title="Share" className="p-2 rounded bg-white/80">⤴</button>
          <button title="Quick View" onClick={() => onOpenDetail(product)} className="p-2 rounded bg-white/80">👁</button>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-3">{product.name}</h3>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center text-yellow-500">
          {/* show stars static */}
          <span>★★★★★</span>
        </div>
        <div className="ml-auto text-sm text-gray-500">Available: {product.available}</div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-lg font-bold text-green-700">${product.price.toFixed(2)}</div>
        <div>
          <button className={`px-3 py-1 rounded ${product.inStock ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
