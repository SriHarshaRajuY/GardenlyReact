import React, { useEffect, useState } from "react";
import ProductDetail from "../components/ProductDetail";  // Reuse existing modal

const API_URL = import.meta.env.DEV ? "" : "http://localhost:3000";

export default function Seller() {
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

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allRes, topRes, recentRes] = await Promise.all([
        fetch(`${API_URL}/api/products/seller`),
        fetch(`${API_URL}/api/products/top-sales`),
        fetch(`${API_URL}/api/products/recent-sales`),
      ]);

      if (!allRes.ok || !topRes.ok || !recentRes.ok) throw new Error("Fetch failed");

      const [allData, topData, recentData] = await Promise.all([
        allRes.json(),
        topRes.json(),
        recentRes.json(),
      ]);

      setProducts(allData);
      setTopSales(topData);
      setRecentSales(recentData);
    } catch (err) {
      console.error(err);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const groupByCategory = (prods) => {
    return prods.reduce((acc, p) => {
      const cat = p.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {});
  };

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = Math.min(maxWidth / img.width, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    if (!name || !image || !category || !price || !quantity) {
      alert("All fields required");
      setSubmitting(false);
      return;
    }

    const priceNum = parseFloat(price);
    const quantityNum = parseInt(quantity);
    if (priceNum <= 0 || quantityNum <= 0) {
      alert("Invalid price/quantity");
      setSubmitting(false);
      return;
    }

    let compressed;
    try {
      compressed = await compressImage(image);
    } catch (err) {
      alert("Image compression failed");
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", priceNum);
    formData.append("quantity", quantityNum);

    const blob = await fetch(compressed).then((r) => r.blob());
    formData.append("image", blob, image.name);

    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setQuantity("");
        setImage(null);
        fetchAll();
        alert("Product added!");
      } else {
        alert(data.message || "Add failed");
      }
    } catch (err) {
      alert("Add failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (p) => {
    const newName = prompt("New name:", p.name);
    const newDesc = prompt("New description:", p.description);
    const newCat = prompt("New category:", p.category);
    const newPrice = prompt("New price:", p.price);
    const newQty = prompt("New quantity:", p.quantity);

    if (!newName || !newCat || !newPrice || !newQty) return;

    const priceNum = parseFloat(newPrice);
    const qtyNum = parseInt(newQty);
    if (priceNum <= 0 || qtyNum < 0) {
      alert("Invalid input");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          category: newCat,
          price: priceNum,
          quantity: qtyNum,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAll();
        alert("Updated!");
      } else {
        alert("Update failed");
      }
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm("Delete?")) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchAll();
        alert("Deleted!");
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const grouped = groupByCategory(products);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      {/* Form */}
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mb-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
          >
            {submitting ? "Adding..." : "Post Product"}
          </button>
        </form>
      </div>

      {/* Products Sections */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <>
            {/* Your Products */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-6">Your Products</h2>
              {Object.keys(grouped).length === 0 ? (
                <p className="text-center text-gray-600">No products. Add one!</p>
              ) : (
                Object.entries(grouped).map(([cat, prods]) => (
                  <div key={cat} className="mb-8">
                    <h3 className="text-2xl font-semibold mb-4">{cat}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {prods.map((p) => (
                        <div key={p.id} className="bg-white rounded-lg shadow p-4">
                          <img src={p.image} alt={p.name} className="w-full h-48 object-cover rounded" />
                          <h4 className="mt-2 font-bold">{p.name}</h4>
                          <p>Price: ₹{p.price}</p>
                          <p>Quantity: {p.quantity}</p>
                          <p>Sold: {p.sold}</p>
                          <div className="mt-2 space-x-2">
                            <button onClick={() => setDetailProduct(p)} className="bg-green-600 text-white px-2 py-1 rounded">
                              Details
                            </button>
                            <button onClick={() => handleEdit(p)} className="bg-blue-600 text-white px-2 py-1 rounded">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(p)} className="bg-red-600 text-white px-2 py-1 rounded">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* Recent Sales */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-6">Recent Sales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recentSales.map((p) => (
                  <div key={p.id} className="bg-white rounded-lg shadow p-4">
                    <img src={p.image} alt={p.name} className="w-full h-48 object-cover rounded" />
                    <h4 className="mt-2 font-bold">{p.name}</h4>
                    <p>Price: ₹{p.price}</p>
                    <p>Quantity: {p.quantity}</p>
                    <p>Sold: {p.sold}</p>
                    <div className="mt-2 space-x-2">
                      <button onClick={() => setDetailProduct(p)} className="bg-green-600 text-white px-2 py-1 rounded">
                        Details
                      </button>
                      <button onClick={() => handleEdit(p)} className="bg-blue-600 text-white px-2 py-1 rounded">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p)} className="bg-red-600 text-white px-2 py-1 rounded">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Sales */}
            <section>
              <h2 className="text-3xl font-bold text-center mb-6">Top Sales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {topSales.map((p) => (
                  <div key={p.id} className="bg-white rounded-lg shadow p-4">
                    <img src={p.image} alt={p.name} className="w-full h-48 object-cover rounded" />
                    <h4 className="mt-2 font-bold">{p.name}</h4>
                    <p>Price: ₹{p.price}</p>
                    <p>Quantity: {p.quantity}</p>
                    <p>Sold: {p.sold}</p>
                    <div className="mt-2 space-x-2">
                      <button onClick={() => setDetailProduct(p)} className="bg-green-600 text-white px-2 py-1 rounded">
                        Details
                      </button>
                      <button onClick={() => handleEdit(p)} className="bg-blue-600 text-white px-2 py-1 rounded">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p)} className="bg-red-600 text-white px-2 py-1 rounded">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Reuse ProductDetail Modal */}
      {detailProduct && (
        <ProductDetail product={detailProduct} onClose={() => setDetailProduct(null)} />
      )}
    </div>
  );
}