import { useEffect, useState } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/admin/products", {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load products");
          setLoading(false);
          return;
        }

        setProducts(data.products);
        setLoading(false);
      } catch (err) {
        setError("Server error");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="text-gray-600">Loading products...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white border rounded-xl shadow-sm">
      <div className="p-5 border-b">
        <h2 className="text-xl font-semibold text-gray-800">All Products</h2>
        <p className="text-sm text-gray-500">
          Products uploaded by sellers
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left">Image</th>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Category</th>
              <th className="px-5 py-3 text-left">Price</th>
              <th className="px-5 py-3 text-left">Stock</th>
              <th className="px-5 py-3 text-left">Sold</th>
              <th className="px-5 py-3 text-left">Seller</th>
              <th className="px-5 py-3 text-left">Created</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-5 py-10 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <img
                      src={p.image?.startsWith("/") ? p.image : `/images/${p.image}`}
                      alt={p.name}
                      className="w-14 h-14 object-cover rounded-lg border"
                      onError={(e) => (e.target.src = "/images/fallback.png")}
                    />
                  </td>

                  <td className="px-5 py-3 font-medium">{p.name}</td>

                  <td className="px-5 py-3">
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                      {p.category}
                    </span>
                  </td>

                  <td className="px-5 py-3 font-semibold text-green-600">
                    ₹{p.price}
                  </td>

                  <td className="px-5 py-3">{p.quantity}</td>

                  <td className="px-5 py-3">{p.sold}</td>

                  <td className="px-5 py-3 text-sm">
                    {p.seller_id?.username || "Unknown"}
                  </td>

                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}