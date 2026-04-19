import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, Heart, MessageCircle, Send, Plus, X, Sprout, 
  User, Clock, Hash, Globe, Filter, MoreVertical, 
  Trash2, ChevronLeft, ChevronRight, Image as ImageIcon,
  PlayCircle, Loader2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Community() {
  const { user } = useAuth();
  const socket = useSocket();
  
  // State
  const [communities, setCommunities] = useState({ joined: [], suggested: [] });
  const [activeComm, setActiveComm] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Modals & Forms
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCommModal, setShowCommModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPost, setNewPost] = useState({ content: "", mediaUrl: "", mediaType: "none" });
  const [newComm, setNewComm] = useState({ name: "", description: "", category: "General", image: "" });
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (activeComm) {
      fetchPosts(activeComm._id);
      if (socket) {
        socket.emit("join_post", activeComm._id); // Reusing 'join_post' as 'join_room'
      }
    }
  }, [activeComm, socket]);

  useEffect(() => {
    if (socket) {
      const handleNewPost = (data) => {
        if (data.communityId === activeComm?._id) {
          setPosts(prev => [data.post, ...prev]);
        }
      };
      
      const handleNewComment = (data) => {
        setPosts(prev => prev.map(p => 
          p._id === data.postId ? { ...p, comments: [...p.comments, data.comment] } : p
        ));
      };

      const handleLikeUpdate = (data) => {
        setPosts(prev => prev.map(p => 
          p._id === data.postId ? { ...p, likes: data.likes } : p
        ));
      };

      socket.on("receive_post", handleNewPost);
      socket.on("receive_comment", handleNewComment);
      socket.on("receive_like", handleLikeUpdate);

      return () => {
        socket.off("receive_post");
        socket.off("receive_comment");
        socket.off("receive_like");
      };
    }
  }, [socket, activeComm]);

  const fetchCommunities = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/community", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setCommunities({ joined: data.joined, suggested: data.suggested });
        if (data.joined.length > 0 && !activeComm) {
          setActiveComm(data.joined.find(c => c.name === "World Community") || data.joined[0]);
        }
      }
    } catch (err) { console.error(err); }
  };

  const fetchPosts = async (communityId) => {
    setLoading(true);
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/community/posts?communityId=${communityId}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setPosts(data.posts);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleJoin = async (id) => {
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/community/join/${id}`, { method: "POST", credentials: "include" });
      if (res.ok) fetchCommunities();
    } catch (err) { console.error(err); }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim() && !newPost.mediaUrl) return;
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPost, communityId: activeComm._id }),
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        socket?.emit("new_post", { communityId: activeComm._id, post: data.post });
        setNewPost({ content: "", mediaUrl: "", mediaType: "none" });
        setShowPostModal(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/community/posts/${postId}/like`, { method: "POST", credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        // Update locally
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
        // Broadcast to others
        socket?.emit("new_like", { communityId: activeComm._id, postId, likes: data.likes });
      }
    } catch (err) { console.error(err); }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/community/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText[postId] }),
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const newComment = data.comments[data.comments.length - 1];
        // Update locally
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: data.comments } : p));
        // Broadcast to others
        socket?.emit("new_comment", { communityId: activeComm._id, postId, comment: newComment });
        setCommentText({ ...commentText, [postId]: "" });
      }
    } catch (err) { console.error(err); }
  };


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/upload", { method: "POST", body: formData, credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setNewPost({ ...newPost, mediaUrl: data.url, mediaType: "image" });
      }
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const handleCreateComm = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComm),
        credentials: "include"
      });
      if (res.ok) {
        fetchCommunities();
        setShowCommModal(false);
        setNewComm({ name: "", description: "", category: "General", image: "" });
      }
    } catch (err) { console.error(err); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/community/posts/${postId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) setPosts(posts.filter(p => p._id !== postId));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="pt-16 min-h-screen bg-[#f0f2f5] dark:bg-gray-950 flex overflow-hidden h-screen">
      
      {/* --- SIDEBAR --- */}
      <aside className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col h-full overflow-hidden relative`}>
        <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-black flex items-center gap-2"><Globe className="text-green-600" /> Communities</h2>
          <button onClick={() => setShowCommModal(true)} className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:scale-110 transition"><Plus size={20} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          {/* Joined */}
          <div>
             <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Your Groups</p>
             <div className="space-y-2">
               {communities.joined.map(c => (
                 <button 
                  key={c._id} 
                  onClick={() => setActiveComm(c)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition ${activeComm?._id === c._id ? "bg-green-600 text-white shadow-lg" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                 >
                   <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200">
                     <img src={c.image || "https://ui-avatars.com/api/?name="+c.name} className="w-full h-full object-cover" alt="" />
                   </div>
                   <div className="text-left overflow-hidden">
                     <p className="font-bold text-sm truncate">{c.name}</p>
                     <p className={`text-[10px] truncate ${activeComm?._id === c._id ? "text-green-100" : "text-gray-400"}`}>{c.description}</p>
                   </div>
                 </button>
               ))}
             </div>
          </div>

          {/* Suggested */}
          {communities.suggested.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Discover</p>
              <div className="space-y-3">
                {communities.suggested.map(c => (
                  <div key={c._id} className="flex items-center justify-between gap-3 p-2 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                        <img src={c.image || "https://ui-avatars.com/api/?name="+c.name} className="w-full h-full object-cover" alt="" />
                      </div>
                      <p className="text-sm font-bold truncate">{c.name}</p>
                    </div>
                    <button onClick={() => handleJoin(c._id)} className="text-[10px] font-black text-green-600 hover:underline">JOIN</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* --- FEED AREA --- */}
      <main className="flex-1 flex flex-col h-full bg-[#f0f2f5] dark:bg-gray-950 relative overflow-hidden">
        
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-900 p-1 rounded-r-lg border border-l-0 dark:border-gray-800 shadow-sm text-gray-400 hover:text-green-600 transition"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {activeComm ? (
          <>
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-8 py-4 flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md">
                   <img src={activeComm.image || "https://ui-avatars.com/api/?name="+activeComm.name} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <h3 className="text-xl font-black">{activeComm.name}</h3>
                  <p className="text-xs text-gray-400 font-bold">{activeComm.members?.length} members • {activeComm.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowPostModal(true)}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg shadow-green-100 dark:shadow-none hover:scale-105 transition flex items-center gap-2"
                >
                  <Plus size={18} /> New Post
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Posts Scroll */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Loader2 className="animate-spin mb-2" />
                  <p className="font-bold">Loading feed...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
                   <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                      <Sprout size={40} className="text-green-600" />
                   </div>
                   <h4 className="text-xl font-black mb-2">Quiet here...</h4>
                   <p className="text-sm text-gray-400">Be the first to share something in {activeComm.name}!</p>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-10">
                  {posts.map(post => (
                    <article key={post._id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Post Head */}
                      <div className="p-6 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center font-bold text-green-600 border dark:border-green-900/30">
                              {post.username[0].toUpperCase()}
                            </div>
                            <div>
                               <p className="font-black text-sm">{post.username}</p>
                               <p className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-widest font-bold">
                                 <Clock size={10} /> {new Date(post.createdAt).toLocaleDateString()}
                               </p>
                            </div>
                         </div>
                         {(post.userId === user?.id || activeComm.adminId === user?.id) && (
                            <button onClick={() => handleDeletePost(post._id)} className="p-2 hover:text-red-500 transition text-gray-300"><Trash2 size={16} /></button>
                         )}
                      </div>

                      {/* Content */}
                      <div className="px-6 pb-6 space-y-4">
                         <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{post.content}</p>
                         {post.mediaUrl && (
                           <div className="rounded-[2rem] overflow-hidden shadow-sm border dark:border-gray-800 bg-black flex items-center justify-center min-h-[300px]">
                              {post.mediaType === "video" ? (
                                <video src={post.mediaUrl} controls className="w-full max-h-[600px]" />
                              ) : (
                                <img src={post.mediaUrl} className="w-full h-auto object-contain" alt="" />
                              )}
                           </div>
                         )}
                      </div>

                      {/* Stats */}
                      <div className="px-6 py-4 flex items-center gap-6 border-t dark:border-gray-800">
                         <button onClick={() => handleLike(post._id)} className="flex items-center gap-2 font-black text-sm text-gray-500 hover:text-red-500 transition">
                            <Heart className={post.likes?.includes(user?.id) ? "fill-red-500 text-red-500" : ""} size={20} /> {post.likes?.length || 0}
                         </button>
                         <button className="flex items-center gap-2 font-black text-sm text-gray-500">
                            <MessageCircle size={20} /> {post.comments?.length || 0}
                         </button>
                      </div>

                      {/* Comments */}
                      <div className="bg-gray-50/50 dark:bg-gray-950/50 p-6 space-y-4">
                         {post.comments?.slice(0, 3).map((c, i) => (
                           <div key={i} className="flex gap-3">
                              <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-[10px] font-black text-green-600 border dark:border-gray-700">
                                {c.username[0].toUpperCase()}
                              </div>
                              <div className="flex-1 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xs border dark:border-gray-700">
                                <p className="text-[10px] font-black mb-0.5">{c.username}</p>
                                <p className="text-xs text-gray-500">{c.text}</p>
                              </div>
                           </div>
                         ))}
                         
                         <div className="flex gap-3 mt-4">
                            <input 
                              placeholder="Write a comment..." 
                              value={commentText[post._id] || ""}
                              onChange={e => setCommentText({ ...commentText, [post._id]: e.target.value })}
                              onKeyDown={e => e.key === "Enter" && handleComment(post._id)}
                              className="flex-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-green-500"
                            />
                            <button onClick={() => handleComment(post._id)} className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-700 transition">
                              <Send size={16} />
                            </button>
                         </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full p-10 text-center">
             <Sprout className="w-16 h-16 text-green-600 mb-6 animate-pulse" />
             <h2 className="text-3xl font-black mb-4">Welcome to Gardenly Social</h2>
             <p className="text-gray-500 max-w-sm mb-10">Select a community from the sidebar to start sharing and learning with other gardeners.</p>
             <button onClick={() => setSidebarOpen(true)} className="text-green-600 font-bold hover:underline">Open Sidebar</button>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative">
              <button onClick={() => setShowPostModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition"><X /></button>
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3"><Globe size={28} className="text-green-600" /> Share Insight</h2>
              
              <form onSubmit={handleCreatePost} className="space-y-6">
                 <textarea 
                  required
                  rows={4}
                  placeholder="What's on your mind?"
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-6 focus:ring-2 focus:ring-green-500 transition resize-none"
                  value={newPost.content}
                  onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                 />
                 
                 <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 cursor-pointer hover:border-green-500 transition">
                       {uploading ? <Loader2 className="animate-spin text-green-600" /> : (
                         <>
                           <ImageIcon size={24} className="text-gray-400 mb-2" />
                           <span className="text-[10px] font-black text-gray-400 uppercase">Image</span>
                         </>
                       )}
                       <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50">
                       <PlayCircle size={24} className="text-gray-400 mb-2" />
                       <span className="text-[10px] font-black text-gray-400 uppercase">Video</span>
                    </div>
                 </div>

                 {newPost.mediaUrl && (
                   <div className="relative rounded-2xl overflow-hidden h-32 bg-black">
                      <img src={newPost.mediaUrl} className="w-full h-full object-contain" alt="" />
                      <button onClick={() => setNewPost({ ...newPost, mediaUrl: "", mediaType: "none" })} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={12} /></button>
                   </div>
                 )}

                 <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-700 transition shadow-xl shadow-green-100 dark:shadow-none">
                    Post to {activeComm.name}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Create Community Modal */}
      {showCommModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative">
            <button onClick={() => setShowCommModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition"><X /></button>
            <h2 className="text-3xl font-black mb-8 flex items-center gap-3"><Globe size={28} className="text-green-600" /> New Community</h2>
            
            <form onSubmit={handleCreateComm} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Name</label>
                <input required value={newComm.name} onChange={e => setNewComm({...newComm, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-6 py-4 border-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Tomato Growers" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Description</label>
                <textarea required value={newComm.description} onChange={e => setNewComm({...newComm, description: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-6 py-4 border-none focus:ring-2 focus:ring-green-500 resize-none" rows={3} placeholder="What is this group about?" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Category</label>
                <select value={newComm.category} onChange={e => setNewComm({...newComm, category: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-6 py-4 border-none focus:ring-2 focus:ring-green-500">
                  <option>General</option>
                  <option>Plants</option>
                  <option>Seeds</option>
                  <option>Pots</option>
                  <option>Tips</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-700 transition shadow-xl shadow-green-100 dark:shadow-none">
                Create Community
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
