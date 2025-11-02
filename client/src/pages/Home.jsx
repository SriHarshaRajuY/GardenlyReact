import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import ProductDetail from "../components/ProductDetail";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentProducts();
  }, []);

  async function fetchRecentProducts() {
    try {
      const res = await fetch("http://localhost:3000/api/products/recent?limit=8");
      const data = await res.json();
      if (res.ok && data.success) setProducts(data.products);
      else console.error("Failed to load products:", data);
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  }

  const openDetail = (p) => setDetailProduct(p);
  const closeDetail = () => setDetailProduct(null);

  // Hero slider images (from /public/images/homeslider)
  const slides = [
    "/images/homeslider/h1.png",
    "/images/homeslider/h2.png",
    "/images/homeslider/h3.png",
  ];

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop
          className="rounded-2xl overflow-hidden shadow-lg"
        >
          {slides.map((s, idx) => (
            <SwiperSlide key={idx}>
              <div
                className="relative h-[420px] md:h-[500px] bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(${s})` }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Content */}
                <div className="relative z-10 text-center text-white">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">
                    Welcome to <span className="text-green-400">Gardenly</span>
                  </h2>
                  <p className="text-lg mb-6 font-light">
                    Grow, nurture, and decorate your world 🌿
                  </p>
                  <a
                    href="#available"
                    className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg shadow-lg text-white transition"
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Category Section */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <h3 className="text-2xl font-semibold text-center mb-10 text-green-700">
          Shop by Category
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 text-center">
          {[
            { name: "PLANTS", img: "/images/category-badges/plants-badge.png", link: "/plants" },
            { name: "SEEDS", img: "/images/category-badges/seeds-badge.png", link: "/seeds" },
            { name: "POTS", img: "/images/category-badges/pots-badge.png", link: "/pots" },
          ].map((cat, i) => (
            <a
              key={i}
              href={cat.link}
              className="flex flex-col items-center gap-3 hover:scale-105 transition-transform duration-300"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="w-24 h-24 object-contain drop-shadow-md"
              />
              <p className="text-sm font-semibold text-gray-700">{cat.name}</p>
            </a>
          ))}
        </div>
      </section>

      {/* New Products Section */}
      <section id="available" className="max-w-7xl mx-auto px-4 py-10 bg-white rounded-2xl shadow-sm mb-16">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
          New Arrivals 🌱
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((p) => (
              <div
                key={p._id || p.id}
                className="border border-gray-100 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-300 bg-white"
              >
                <img
                  src={p.image || "/images/plants/plant1.png"}
                  alt={p.name}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{p.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{p.category}</p>
                  <p className="text-green-700 font-bold text-lg">₹{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Product Details Modal */}
      {detailProduct && (
        <ProductDetail product={detailProduct} onClose={closeDetail} />
      )}
    </div>
  );
}
