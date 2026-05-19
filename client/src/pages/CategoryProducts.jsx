import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductDetail from "../components/ProductDetail";

const DEFAULT_LIMIT = 12;

export default function CategoryProducts({
  category,
  title,
  offerTitle,
  offerSubtitle,
  offerCode,
  accent = "green",
  priceRanges,
}) {
  const [products, setProducts] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [availability, setAvailability] = useState("all");

  const styles = {
    green: {
      hero: "from-emerald-500 to-green-700",
      text: "text-green-700",
      button: "bg-green-600 hover:bg-green-700",
      ring: "focus:ring-green-500",
      pale: "bg-green-50",
      spinner: "border-green-700",
    },
    amber: {
      hero: "from-amber-500 to-yellow-700",
      text: "text-amber-700",
      button: "bg-amber-600 hover:bg-amber-700",
      ring: "focus:ring-amber-500",
      pale: "bg-amber-50",
      spinner: "border-amber-700",
    },
    blue: {
      hero: "from-blue-500 to-cyan-700",
      text: "text-blue-700",
      button: "bg-blue-600 hover:bg-blue-700",
      ring: "focus:ring-blue-500",
      pale: "bg-blue-50",
      spinner: "border-blue-700",
    },
  }[accent];

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const baseUrl = (import.meta.env.VITE_BACKEND_URL || "").trim();
        const res = await fetch(
          `${baseUrl}/api/products/category/${category}?page=${page}&limit=${DEFAULT_LIMIT}`,
          { credentials: "include", signal: controller.signal }
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || `Failed to load ${category.toLowerCase()}`);
        }

        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        if (err.name !== "AbortError") {
          setProducts([]);
          setTotalPages(1);
          setError(err.message || `Failed to load ${category.toLowerCase()}`);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [category, page]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (selectedPrices.length) {
      list = list.filter((product) =>
        selectedPrices.some((range) => {
          const price = Number(product.price || 0);
          return price >= range.min && price <= range.max;
        })
      );
    }

    if (availability === "inStock") {
      list = list.filter((product) => Number(product.quantity || 0) > 0);
    } else if (availability === "outOfStock") {
      list = list.filter((product) => Number(product.quantity || 0) <= 0);
    }

    switch (sortBy) {
      case "low":
        return list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      case "high":
        return list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      case "az":
        return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      case "za":
        return list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      default:
        return list;
    }
  }, [availability, products, selectedPrices, sortBy]);

  const togglePrice = (range) => {
    setSelectedPrices((current) =>
      current.some((item) => item.label === range.label)
        ? current.filter((item) => item.label !== range.label)
        : [...current, range]
    );
  };

  return (
    <div className={`min-h-screen ${styles.pale} pt-20`}>
      <div className={`bg-gradient-to-r ${styles.hero} text-white text-center py-16 px-4 shadow-xl`}>
        <h2 className="text-4xl md:text-5xl font-bold mb-2">{offerTitle}</h2>
        <p className="text-lg">{offerSubtitle}</p>
        {offerCode && (
          <p className="mt-1">
            Use Code: <strong>{offerCode}</strong>
          </p>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <Link to="/" className={`${styles.text} text-sm font-bold hover:underline`}>
                Home
              </Link>
              <h1 className={`text-3xl font-bold ${styles.text} mt-2`}>{title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {loading ? "Loading..." : `${filtered.length} products on this page`}
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <select
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
                className={`px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 ${styles.ring}`}
                aria-label="Filter by availability"
              >
                <option value="all">All availability</option>
                <option value="inStock">In stock</option>
                <option value="outOfStock">Out of stock</option>
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className={`px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 ${styles.ring}`}
                aria-label="Sort products"
              >
                <option value="newest">Newest first</option>
                <option value="low">Price, low to high</option>
                <option value="high">Price, high to low</option>
                <option value="az">Name, A to Z</option>
                <option value="za">Name, Z to A</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSelectedPrices([]);
                  setAvailability("all");
                  setSortBy("newest");
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            {priceRanges.map((range) => {
              const checked = selectedPrices.some((item) => item.label === range.label);
              return (
                <label
                  key={range.label}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm cursor-pointer ${
                    checked ? `${styles.button} text-white border-transparent` : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePrice(range)}
                    className="sr-only"
                  />
                  {range.label}
                </label>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-gray-500">
            <div className={`mx-auto mb-3 h-10 w-10 rounded-full border-4 border-t-transparent ${styles.spinner} animate-spin`} />
            Loading {category.toLowerCase()}...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-20 text-center text-gray-500">
            No {category.toLowerCase()} found for the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} onOpenDetail={setDetailProduct} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={page === 1}
              className="px-6 py-2 bg-white border border-gray-300 rounded-full font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
              disabled={page === totalPages}
              className={`${styles.button} px-6 py-2 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {detailProduct && (
        <ProductDetail product={detailProduct} onClose={() => setDetailProduct(null)} />
      )}
    </div>
  );
}
