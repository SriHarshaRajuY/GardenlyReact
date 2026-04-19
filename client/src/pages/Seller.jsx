import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import ProductDetail from "../components/ProductDetail";
import { PlusCircle, Package, TrendingUp, Tag, UploadCloud, FileText, Image as ImageIcon, DollarSign } from "lucide-react";

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
  const [showAddForm, setShowAddForm] = useState(false);

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
        fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/products/seller", { credentials: "include" }),
        fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/products/top-sales", { credentials: "include" }),
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
  // With Cloudinary, we don't necessarily need to compress locally, but it's fine to keep it to reduce upload size.
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
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/products", {
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
        setShowAddForm(false);
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

  const totalProducts = products.length;
  const totalSales = products.reduce((sum, p) => sum + (p.sold || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * (p.sold || 0)), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DASHBOARD HEADER & STATS */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
            Seller Dashboard
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                <Package size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProducts}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                <TrendingUp size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSales} items</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                <DollarSign size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Inventory Management</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow active:scale-95"
          >
            {showAddForm ? "Cancel" : <><PlusCircle size={20} /> Add New Product</>}
          </button>
        </div>

        {/* ADD PRODUCT FORM */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-4 dark:border-gray-700">Product Details</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Tag size={18} />
                    </div>
                    <input type="text" placeholder="e.g. Monstera Deliciosa" value={name} onChange={(e)=>setName(e.target.value)} className="pl-10 w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all">
                    <option value="">Select Category</option>
                    <option value="Plants">Plants</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Pots">Pots</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                    <input type="number" min="0" placeholder="0.00" value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                    <input type="number" min="1" placeholder="1" value={quantity} onChange={(e)=>setQuantity(e.target.value)} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex flex-col">
                <div className="flex-grow flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <div className="relative flex-grow flex flex-col">
                    <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                      <FileText size={18} />
                    </div>
                    <textarea placeholder="Describe your product..." value={description} onChange={(e)=>setDescription(e.target.value)} className="pl-10 w-full flex-grow p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none min-h-[120px]"/>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
                  <label className="flex items-center justify-center w-full p-4 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                    <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 group-hover:text-green-600 transition-colors">
                      {image ? <ImageIcon size={24} className="text-green-500" /> : <UploadCloud size={24} />}
                      <span className="font-medium">{image ? image.name : "Click to upload an image"}</span>
                    </div>
                    <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center gap-2">
                {submitting ? "Uploading..." : "Publish Product"}
              </button>
            </div>
          </form>
        )}

        {/* PRODUCTS LIST */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <section className="space-y-12">
            {Object.keys(byCategory).length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                <Package size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Your inventory is empty</h3>
                <p className="text-gray-500 mb-6">Start adding products to see them here.</p>
                <button onClick={() => setShowAddForm(true)} className="bg-green-600 text-white px-6 py-2 rounded-full font-medium">Add First Product</button>
              </div>
            ) : (
              Object.entries(byCategory).map(([cat, list]) => (
                <div key={cat} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                      <span className="w-3 h-8 bg-green-500 rounded-full inline-block"></span>
                      {cat}
                    </h3>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 px-3 rounded-full text-sm font-semibold">
                      {list.length} items
                    </span>
                  </div>

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