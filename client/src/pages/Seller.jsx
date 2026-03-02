import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import ProductDetail from "../components/ProductDetail";

export default function Seller() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [topSales, setTopSales] = useState([]);

  const [modalProduct, setModalProduct] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // only seller allowed
  useEffect(() => {
    if (user && user.role !== "seller") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === "seller") {
      fetchAll();
    }
  }, [user]);

  /* ================= FETCH PRODUCTS ================= */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allRes, topRes] = await Promise.all([
        fetch("/api/products/seller", { credentials: "include" }),
        fetch("/api/products/top-sales", { credentials: "include" }),
      ]);

      let all = [];
      let top = [];

      if (allRes.ok) all = await allRes.json();
      if (topRes.ok) top = await topRes.json();

      setProducts(all);
      setTopSales(top);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ================= IMAGE HANDLING ================= */

  const compressImage = (file) =>
    new Promise((res, rej) => {
      if (!file.type.startsWith("image/")) return rej("Not image");

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = Math.min(800 / img.width, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          res(canvas.toDataURL("image/jpeg", 0.7));
        };
      };
      reader.readAsDataURL(file);
    });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return setImage(null);
    if (!file.type.startsWith("image/")) {
      alert("Upload image only");
      return;
    }
    setImage(file);
  };

  /* ================= ADD PRODUCT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!name || !image || !category || !price || !quantity) {
      alert("All fields required");
      return;
    }

    setSubmitting(true);

    const compressed = await compressImage(image);
    const fd = new FormData();
    const blob = await fetch(compressed).then((r) => r.blob());

    fd.append("image", blob, image.name);
    fd.append("name", name.trim());
    fd.append("description", description.trim());
    fd.append("category", category.trim());
    fd.append("price", parseFloat(price));
    fd.append("quantity", parseInt(quantity));

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
        fetchAll();
      } else {
        alert(data.message || "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= GROUP PRODUCTS ================= */

  const byCategory = products.reduce((acc, p) => {
    const cat = p.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ADD PRODUCT FORM */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-12">
          <h2 className="text-2xl font-bold mb-4">Add New Product</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} className="p-2 border rounded" />
            <select value={category} onChange={(e)=>setCategory(e.target.value)} className="p-2 border rounded">
              <option value="">Select Category</option>
              <option value="Plants">Plants</option>
              <option value="Seeds">Seeds</option>
              <option value="Pots">Pots</option>
            </select>
            <input type="number" placeholder="Price" value={price} onChange={(e)=>setPrice(e.target.value)} className="p-2 border rounded" />
            <input type="number" placeholder="Quantity" value={quantity} onChange={(e)=>setQuantity(e.target.value)} className="p-2 border rounded" />
            <input type="file" onChange={handleImageChange} className="p-2 border rounded" />
            <textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} className="p-2 border rounded md:col-span-2"/>
          </div>

          <button type="submit" className="mt-4 w-full bg-green-600 text-white py-2 rounded">
            {submitting ? "Adding..." : "Post Product"}
          </button>
        </form>

        {/* PRODUCTS LIST */}
        {loading ? (
          <p className="text-center text-xl">Loading…</p>
        ) : (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Your Products</h2>

            {Object.keys(byCategory).length === 0 ? (
              <p className="text-gray-500 text-center">No products yet</p>
            ) : (
              Object.entries(byCategory).map(([cat, list]) => (
                <div key={cat} className="mb-10">
                  <h3 className="text-xl font-semibold mb-3">{cat}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {list.map((p) => (
                      <ProductCard
                        key={p._id}
                        product={p}
                        onOpenDetail={setModalProduct}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {modalProduct && (
          <ProductDetail
            product={modalProduct}
            onClose={() => setModalProduct(null)}
          />
        )}
      </div>
    </div>
  );
}