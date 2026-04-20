import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar, User, ArrowRight, Sparkles, Sprout, Heart, MessageCircle, Send, ShieldQuestion } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

export default function Blog() {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  
  const [blogsList, setBlogsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [commentText, setCommentText] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: "", excerpt: "", content: "", category: "Gardening" });
  const [newBlogImage, setNewBlogImage] = useState(null);
  const [submittingBlog, setSubmittingBlog] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/blogs");
      const data = await res.json();
      if (data.success && data.blogs) {
        setBlogsList(data.blogs);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket && selectedBlog) {
      socket.emit("join_post", selectedBlog._id);
      socket.on("receive_comment", (data) => {
        if (data.postId === selectedBlog._id) {
          setSelectedBlog(prev => ({
            ...prev,
            comments: [...prev.comments, data.comment]
          }));
        }
      });
      return () => socket.off("receive_comment");
    }
  }, [socket, selectedBlog]);

  const handleLike = async (blogId) => {
    if (!user) return alert("Please login to like");
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/blogs/${blogId}/like`, { method: "POST", credentials: "include" });
      if (res.ok) fetchBlogs();
    } catch (err) { console.error(err); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/blogs/${selectedBlog._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const newComment = data.comments[data.comments.length - 1];
        if (socket) {
          socket.emit("new_comment", { postId: selectedBlog._id, comment: newComment });
        }
        setSelectedBlog(prev => ({
          ...prev,
          comments: data.comments
        }));
        setCommentText("");
      }
    } catch (err) { console.error(err); }
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!newBlog.title || !newBlog.content || !newBlogImage) return alert("Please fill all fields and select an image");
    setSubmittingBlog(true);
    
    try {
      // 1. Upload Image
      const formData = new FormData();
      formData.append("image", newBlogImage);
      const uploadRes = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/upload`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        setSubmittingBlog(false);
        return alert("Failed to upload image");
      }

      // 2. Create Blog
      const slug = newBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      const blogData = {
        ...newBlog,
        slug,
        image: uploadData.url,
        author: user.username,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      };

      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData),
        credentials: "include"
      });
      
      if (res.ok) {
        alert("Blog published successfully!");
        setShowAddModal(false);
        setNewBlog({ title: "", excerpt: "", content: "", category: "Gardening" });
        setNewBlogImage(null);
        fetchBlogs();
      } else {
        alert("Failed to publish blog");
      }
    } catch (err) {
      console.error(err);
      alert("Error publishing blog");
    } finally {
      setSubmittingBlog(false);
    }
  };

  const categories = ["All", ...new Set(blogsList.map((b) => b.category).filter(Boolean))];

  const filteredBlogs = blogsList.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || blog.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedBlog) {
    return (
      <div className="pt-24 min-h-screen bg-[#f8faf7] dark:bg-gray-950 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedBlog(null)} className="mb-8 text-green-600 font-bold flex items-center gap-2">
            <ArrowRight className="rotate-180" /> Back to Feed
          </button>
          
          <img src={selectedBlog.image} className="w-full h-[400px] object-cover rounded-[3rem] shadow-2xl mb-10" alt="" />
          
          <div className="flex items-center justify-between mb-6">
            <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-black uppercase">{selectedBlog.category}</span>
            <div className="flex gap-4">
              <button onClick={() => handleLike(selectedBlog._id)} className="flex items-center gap-2 font-bold text-gray-500 hover:text-red-500 transition">
                <Heart className={selectedBlog.likes?.includes(user?.id) ? "fill-red-500 text-red-500" : ""} /> {selectedBlog.likes?.length || 0}
              </button>
              <div className="flex items-center gap-2 font-bold text-gray-500">
                <MessageCircle /> {selectedBlog.comments?.length || 0}
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-8 leading-tight">{selectedBlog.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed whitespace-pre-wrap">{selectedBlog.content || selectedBlog.excerpt}</p>
          
          <div className="bg-green-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 mb-16 shadow-xl">
             <div>
               <h3 className="text-2xl font-bold mb-2">Confused about this plant?</h3>
               <p className="text-green-50 opacity-80">Our experts can give you personalized advice based on this article.</p>
             </div>
             <button 
               onClick={() => navigate("/expert-support", { state: { subject: `Question about ${selectedBlog.title}` } })} 
               className="bg-white text-green-700 px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition flex items-center gap-2 whitespace-nowrap"
             >
               <ShieldQuestion /> Ask Expert Now
             </button>
          </div>

          {/* Comment Section */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border dark:border-gray-800">
            <h3 className="text-2xl font-black mb-8">Discussions ({selectedBlog.comments?.length || 0})</h3>
            <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {selectedBlog.comments?.map((c, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center font-bold text-green-600">{c.username?.[0].toUpperCase()}</div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-sm">{c.username}</span>
                      <span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {user ? (
              <form onSubmit={handleComment} className="flex gap-4">
                <input 
                  value={commentText} 
                  onChange={(e) => setCommentText(e.target.value)} 
                  placeholder="Share your thoughts..." 
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-green-500"
                />
                <button type="submit" className="bg-green-600 text-white p-4 rounded-2xl hover:bg-green-700 transition">
                  <Send size={20} />
                </button>
              </form>
            ) : (
              <p className="text-center text-gray-400 italic">Please login to join the discussion.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-[#f8faf7] dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-100">
      <section className="relative py-20 px-6 bg-gradient-to-br from-green-900 to-emerald-900 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
           <h1 className="text-5xl md:text-7xl font-black text-white mb-6">Expert <span className="text-green-400">Insights</span></h1>
           <div className="relative max-w-xl mx-auto group">
              <Search className="absolute left-6 top-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search articles..." 
                className="w-full pl-16 pr-6 py-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-green-400 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           {(user?.role === "admin" || user?.role === "expert") && (
             <button 
               onClick={() => setShowAddModal(true)}
               className="mt-8 bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300"
             >
               + Create New Blog
             </button>
           )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex gap-4 mb-12 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-3 rounded-2xl font-bold transition ${activeCategory === cat ? "bg-green-600 text-white shadow-lg" : "bg-white dark:bg-gray-900 text-gray-500 border dark:border-gray-800"}`}>{cat}</button>
          ))}
        </div>

        {loading ? <div className="text-center py-20"><Sprout className="w-12 h-12 text-green-600 animate-bounce mx-auto" /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredBlogs.map(blog => (
              <article key={blog._id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border dark:border-gray-800 hover:shadow-2xl transition duration-500 flex flex-col group">
                <div className="relative h-64 overflow-hidden">
                  <img src={blog.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-1 rounded-full text-[10px] font-black text-green-700">{blog.category}</div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black mb-4 group-hover:text-green-600 transition">{blog.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 line-clamp-3">{blog.excerpt}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <button onClick={() => setSelectedBlog(blog)} className="text-green-600 font-black flex items-center gap-2 hover:gap-4 transition-all">Read More <ArrowRight /></button>
                    <div className="flex gap-3 text-gray-400">
                       <div className="flex items-center gap-1 font-bold text-xs"><Heart size={14} /> {blog.likes?.length || 0}</div>
                       <div className="flex items-center gap-1 font-bold text-xs"><MessageCircle size={14} /> {blog.comments?.length || 0}</div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Add Blog Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto pt-24">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-3xl p-10 relative my-auto">
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-8 text-3xl text-gray-400 hover:text-red-500">&times;</button>
              <h2 className="text-4xl font-black mb-8 text-green-800 dark:text-green-400">Publish New Blog</h2>
              
              <form onSubmit={handleAddBlog} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Title</label>
                  <input required value={newBlog.title} onChange={e => setNewBlog({...newBlog, title: e.target.value})} className="w-full px-6 py-4 rounded-2xl border dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-green-500" placeholder="Catchy title..." />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">Category</label>
                    <input required value={newBlog.category} onChange={e => setNewBlog({...newBlog, category: e.target.value})} className="w-full px-6 py-4 rounded-2xl border dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-green-500" placeholder="e.g. Indoor Plants" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Cover Image</label>
                    <input required type="file" accept="image/*" onChange={e => setNewBlogImage(e.target.files[0])} className="w-full px-6 py-3.5 rounded-2xl border dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Short Excerpt</label>
                  <textarea required value={newBlog.excerpt} onChange={e => setNewBlog({...newBlog, excerpt: e.target.value})} rows={2} className="w-full px-6 py-4 rounded-2xl border dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-green-500 resize-none" placeholder="A brief summary for the feed..." />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Full Content</label>
                  <textarea required value={newBlog.content} onChange={e => setNewBlog({...newBlog, content: e.target.value})} rows={8} className="w-full px-6 py-4 rounded-2xl border dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-green-500 resize-none" placeholder="Write your expert advice here..." />
                </div>

                <button disabled={submittingBlog} className="w-full bg-green-600 text-white font-black py-5 rounded-2xl text-xl hover:bg-green-700 transition disabled:opacity-50">
                  {submittingBlog ? "Publishing..." : "Publish Blog"}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}