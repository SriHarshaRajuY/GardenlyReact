import React, { useEffect, useState } from "react";
import ProductDetail from "../components/ProductDetail";
import { useNavigate } from "react-router-dom";

export default function Seller() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [topSales, setTopSales] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // 1. Check JWT
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/check", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.isAuthenticated && data.role === "Seller") {
          setIsSeller(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setAuthChecked(true);
        fetchAll();
      }
    };
    check();
  }, []);

  // 2. Fetch products
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allRes, topRes, recentRes] = await Promise.all([
        fetch("/api/products/seller", { credentials: "include" }),
        fetch("/api/products/top-sales", { credentials: "include" }),
        fetch("/api/products/recent-sales", { credentials: "include" }),
      ]);

      const [allData = [], topData = [], recentData = []] = await Promise.all([
        allRes.ok ? allRes.json() : [],
        topRes.ok ? topRes.json() : [],
        recentRes.ok ? recentRes.json() : [],
      ]);

      setProducts(allData);
      setTopSales(topData);
      setRecentSales(recentData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 3. Compress image
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

  // 4. Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSeller) {
      alert("Login as Seller to add product");
      navigate("/login");
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    if (!name || !image || !category || !price || !quantity) {
      alert("All fields required");
      setSubmitting(false);
      return;
    }

    const p = parseFloat(price);
    const q = parseInt(quantity, 10);
    if (p <= 0 || q <= 0) {
      alert("Invalid price/quantity");
      setSubmitting(false);
      return;
    }

    let compressed;
    try { compressed = await compressImage(image); }
    catch { alert("Image error"); setSubmitting(false); return; }

    const fd = new FormData();
    const blob = await fetch(compressed).then(r => r.blob());
    fd.append("image", blob, image.name);
    fd.append("name", name.trim());
    fd.append("description", description?.trim() || "");
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
        setName(""); setDescription(""); setCategory(""); setPrice(""); setQuantity(""); setImage(null);
        document.getElementById("image-input").value = "";
        await fetchAll();
      } else {
        alert(data.message || "Failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center"><p>Checking login...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-green-700">
          {isSeller ? "Seller Dashboard" : "All Products"}
        </h1>

        {isSeller && (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg mb-12">
            <h2 className="text-2xl font-semibold mb-6">Add New Product</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="p-3 border rounded-lg" required />
              <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} className="p-3 border rounded-lg" required />
              <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} className="p-3 border rounded-lg" required />
              <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} className="p-3 border rounded-lg" required />
              <input id="image-input" type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="p-3 border rounded-lg" required />
              <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="p-3 border rounded-lg md:col-span-2" rows="3" />
            </div>
            <button type="submit" disabled={submitting} className="mt-6 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {submitting ? "Adding..." : "Post Product"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">{isSeller ? "Your Products" : "All Products"}</h2>
              {products.length === 0 ? (
                <p className="text-center text-gray-500">No products.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="bg-white rounded-lg shadow p-4">
                      <img src={p.image} alt={p.name} className="w-full h-48 object-cover rounded" />
                      <h4 className="mt-2 font-bold">{p.name}</h4>
                      <p>₹{p.price}</p>
                      <p>Qty: {p.quantity}</p>
                      <button onClick={() => setDetailProduct(p)} className="mt-2 w-full bg-green-600 text-white py-1 rounded text-sm">Details</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {detailProduct && <ProductDetail product={detailProduct} onClose={() => setDetailProduct(null)} />}
    </div>
  );
}