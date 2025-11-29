// src/pages/Seller.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import ProductDetail from "../components/ProductDetail";
//Seller function 

export default function Seller() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  //top sales
  const [topSales, setTopSales] = useState([]);
  //recent sales
  const [recentSales, setRecentSales] = useState([]);
  const [modalProduct, setModalProduct] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch when component mounts or user changes
  useEffect(() => {
    fetchAll();
  }, [user]);
  //fetching products
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allRes, topRes, recentRes] = await Promise.all([
        fetch("/api/products/seller", { credentials: "include" }),
        fetch("/api/products/top-sales", { credentials: "include" }),
        fetch("/api/products/recent-sales", { credentials: "include" }),
      ]);

      let all = [];
      let top = [];
      let recent = [];

      if (allRes.ok) {
        all = await allRes.json();
      }
      if (topRes.ok) {
        top = await topRes.json();
      }
      if (recentRes.ok) {
        recent = await recentRes.json();
      }

      setProducts(all);
      setTopSales(top);
      setRecentSales(recent);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ---------- IMAGE COMPRESS ----------
  const compressImage = (file) =>
    new Promise((res) => {
      const r = new FileReader();
      r.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const c = document.createElement("canvas");
          const s = Math.min(800 / img.width, 1);
          c.width = img.width * s;
          c.height = img.height * s;
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          res(c.toDataURL("image/jpeg", 0.7));
        };
      };
      r.readAsDataURL(file);
    });

    //handle sumit 

  // ---------- SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!user || user.role !== "seller") {
      alert("You must login as a Seller to add a product");
      navigate("/signin");
      return;
    }

    if (!name || !image || !category || !price || !quantity) {
      alert("All fields are required");
      return;
    }

    const p = parseFloat(price);
    const q = parseInt(quantity, 10);
    if (p <= 0 || q <= 0) {
      alert("Price and quantity must be positive");
      return;
    }
    if (image.size > 5 * 1024 * 1024) {
      alert("Image must be ≤ 5 MB");
      return;
    }

    setSubmitting(true);
    let compressed;
    try {
      compressed = await compressImage(image);
    } catch {
      alert("Image compression failed");
      setSubmitting(false);
      return;
    }

    const fd = new FormData();
    const blob = await fetch(compressed).then((r) => r.blob());
    fd.append("image", blob, image.name);
    fd.append("name", name.trim());
    fd.append("description", description.trim());
    fd.append("category", category.trim());
    fd.append("price", p);
    fd.append("quantity", q);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Product added!");
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setQuantity("");
        setImage(null);
        document.getElementById("image-input").value = "";
        fetchAll();
      } else {
        alert(data.message || "Failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- EDIT ----------
  //handled edit property

  const handleEdit = async (prod) => {
    const n = prompt("New name:", prod.name);
    const d = prompt("New description:", prod.description);
    const c = prompt("New category:", prod.category);
    const pr = prompt("New price:", prod.price);
    const q = prompt("New quantity:", prod.quantity);
    if (!n || !c || !pr || !q) return;

    const priceNum = parseFloat(pr);
    const qtyNum = parseInt(q);
    if (isNaN(priceNum) || priceNum <= 0 || isNaN(qtyNum) || qtyNum < 0) {
      alert("Invalid price/quantity");
      return;
    }

    try {
      const res = await fetch(`/api/products/${prod._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          description: d,
          category: c,
          price: priceNum,
          quantity: qtyNum,
        }),
        credentials: "include",
      });
      if (res.ok) {
        alert("Updated!");
        fetchAll();
      } else {
        const txt = await res.text();
        alert(txt || "Update failed");
      }
    } catch {
      alert("Edit error");
    }
  };

  // ---------- DELETE ----------
  const handleDelete = async (prod) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${prod._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        alert("Deleted!");
        fetchAll();
      } else {
        alert("Delete failed");
      }
    } catch {
      alert("Delete error");
    }
  };

  // ---------- GROUP BY CATEGORY ----------
  //handle the category 

  const byCategory = products.reduce((acc, p) => {
    const cat = p.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-12">
          <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border dark:border-gray-600 rounded bg-transparent" required />
            <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border dark:border-gray-600 rounded bg-transparent" required />
            <input type="number" placeholder="Price" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="p-2 border dark:border-gray-600 rounded bg-transparent" required />
            <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="p-2 border dark:border-gray-600 rounded bg-transparent" required />
            <input id="image-input" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="p-2 border dark:border-gray-600 rounded bg-transparent" required />
            <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows="2" className="md:col-span-2 p-2 border dark:border-gray-600 rounded bg-transparent" />
          </div>
          <button type="submit" disabled={submitting} className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50">
            {submitting ? "Adding…" : "Post Product"}
          </button>
        </form>

        {loading ? (
          <p className="text-center text-xl">Loading…</p>
        ) : (
          <>
            {/* Products by Category */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">
                {user?.role === "seller" ? "Your Products" : "All Products"}
              </h2>
              {Object.keys(byCategory).length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No products yet. Add one!
                </p>
              ) : (
                Object.entries(byCategory).map(([cat, list]) => (
                  <div key={cat} className="mb-10">
                    <h3 className="text-2xl font-semibold mb-3">{cat}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {list.map((p) => (
                        <ProductCard
                          key={p._id}
                          product={p}
                          onView={setModalProduct}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* Recent Sales */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Recent Sales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recentSales.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onView={setModalProduct}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>

            {/* Top Sales */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Top Sales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {topSales.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onView={setModalProduct}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Product Detail */}
        {modalProduct && <ProductDetail product={modalProduct} onClose={() => setModalProduct(null)} />}
      </div>
    </div>
  );
}