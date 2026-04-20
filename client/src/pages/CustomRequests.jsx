import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  PackageOpen, 
  Send, 
  CheckCircle, 
  Clock, 
  PlusCircle, 
  IndianRupee, 
  MessageSquareText, 
  UserCircle,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function CustomRequests() {
  const { user } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  
  const [proposalPrice, setProposalPrice] = useState("");
  const [proposalMessage, setProposalMessage] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const baseUrl = (import.meta.env.VITE_BACKEND_URL || '').trim();
      const url = user.role === "seller" ? `${baseUrl}/api/custom-requests/open` : `${baseUrl}/api/custom-requests/my-requests`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, budget: Number(budget) }),
        credentials: "include"
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setBudget("");
        fetchRequests();
        alert("Request posted successfully! Sellers will now see your requirement.");
      } else {
        alert("Failed to post request.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/custom-requests/${selectedRequest}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Number(proposalPrice), message: proposalMessage }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProposalMessage("");
        setProposalPrice("");
        setSelectedRequest(null);
        fetchRequests();
        alert("Proposal submitted! The buyer has been notified.");
      } else {
        alert(data.message || "Failed to submit proposal");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptProposal = async (requestId, proposalId) => {
    if (!window.confirm("Accepting this proposal will confirm the deal and share contact details via email. Proceed?")) return;
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/custom-requests/${requestId}/proposals/${proposalId}/accept`, {
        method: "PUT",
        credentials: "include"
      });
      if (res.ok) {
        fetchRequests();
        alert("Proposal accepted! Check your email for seller contact details.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center p-12 bg-white dark:bg-gray-900 rounded-3xl shadow-xl">
          <UserCircle size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-gray-500 mt-2">Please login to view or create custom requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfc] dark:bg-gray-950 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-100 dark:shadow-none">
              <PackageOpen size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Custom Market</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {user.role === "seller" ? "Bid on exclusive buyer requirements." : "Get quotes for your unique plant needs."}
              </p>
            </div>
          </div>
          {user.role !== "seller" && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-800">
               <Sparkles className="text-green-600 w-5 h-5" />
               <span className="text-green-700 dark:text-green-400 text-sm font-bold">Personalized Sourcing</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Sidebar / Post Form */}
          <div className="lg:col-span-1">
            {user.role !== "seller" ? (
              <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl shadow-gray-100 dark:shadow-none border border-gray-100 dark:border-gray-800 sticky top-28">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <PlusCircle className="text-green-600" size={24} /> Post Requirement
                </h2>
                <form onSubmit={handleCreateRequest} className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">Title</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Rare Philodendron" className="w-full p-4 border dark:border-gray-700 dark:bg-gray-800 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">Budget (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-4 text-gray-400" size={18} />
                      <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="1000" className="w-full p-4 pl-12 border dark:border-gray-700 dark:bg-gray-800 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">Details</label>
                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe age, size, condition..." className="w-full p-4 border dark:border-gray-700 dark:bg-gray-800 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none min-h-[120px] resize-none"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-100 dark:shadow-none">
                    <Send size={18} /> Publish Request
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 rounded-[2rem] text-white shadow-xl">
                 <h2 className="text-2xl font-bold mb-4">Seller Pro Tips</h2>
                 <ul className="space-y-4 opacity-90 text-sm">
                   <li className="flex gap-3"><CheckCircle size={18} className="flex-shrink-0" /> Be descriptive in your proposals.</li>
                   <li className="flex gap-3"><CheckCircle size={18} className="flex-shrink-0" /> Mention your expertise with the specific plant.</li>
                   <li className="flex gap-3"><CheckCircle size={18} className="flex-shrink-0" /> Response time matters for conversion.</li>
                 </ul>
              </div>
            )}
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {user.role === "seller" ? "Available Opportunities" : "My Active Requests"}
              </h2>
              <button onClick={fetchRequests} className="text-sm font-bold text-green-600 hover:text-green-700">Refresh Feed</button>
            </div>
            
            {loading ? (
              <div className="py-20 text-center"><div className="animate-spin w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div></div>
            ) : requests.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 p-16 rounded-[2.5rem] text-center border dark:border-gray-800">
                <PackageOpen size={64} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">No active requests found at the moment.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition">{req.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'Open' ? 'bg-blue-100 text-blue-700' : req.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {req.status}
                          </span>

                        </div>
                        <div className="flex items-center gap-4 text-sm font-bold">
                          <div className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg">
                            <IndianRupee size={14} /> {req.budget || "Negotiable"}
                          </div>
                          <div className="text-gray-400 flex items-center gap-1">
                            <Clock size={14} /> {new Date(req.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {user.role === "seller" && req.status === "Open" && selectedRequest !== req._id && (
                        <button onClick={() => setSelectedRequest(req._id)} className="bg-gray-900 text-white dark:bg-green-600 px-5 py-2 rounded-xl text-sm font-bold hover:scale-105 transition">
                          Bid Now
                        </button>
                      )}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl mb-8 border dark:border-gray-700">
                      {req.description}
                    </p>

                    {/* Proposal Form for Seller */}
                    {selectedRequest === req._id && (
                      <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-3xl border border-green-200 dark:border-green-800 mb-6 animate-in fade-in zoom-in duration-300">
                        <h4 className="font-black text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
                          <MessageSquareText size={20} /> Submit Your Proposal
                        </h4>
                        <form onSubmit={handleSubmitProposal} className="space-y-4">
                          <div className="grid md:grid-cols-4 gap-4">
                            <div className="md:col-span-3">
                              <input type="text" required value={proposalMessage} onChange={(e) => setProposalMessage(e.target.value)} placeholder="What can you offer?" className="w-full p-4 rounded-2xl border dark:border-gray-700 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-600" />
                            </div>
                            <div>
                              <input type="number" required value={proposalPrice} onChange={(e) => setProposalPrice(e.target.value)} placeholder="₹ Price" className="w-full p-4 rounded-2xl border dark:border-gray-700 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-600" />
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end">
                            <button type="button" onClick={() => setSelectedRequest(null)} className="px-6 py-3 text-gray-500 font-bold">Cancel</button>
                            <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-green-100 dark:shadow-none hover:bg-green-700">Send Proposal</button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Proposals List for Buyer */}
                    {user.role !== "seller" && req.proposals && req.proposals.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-4">
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                           <h4 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">Received Bids ({req.proposals.length})</h4>
                        </div>
                        <div className="grid gap-4">
                          {req.proposals.map(p => (
                            <div key={p._id} className={`p-6 rounded-3xl border transition-all ${p.status === 'Accepted' ? 'bg-green-50 border-green-300 dark:bg-green-900/10 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center font-bold text-gray-400">
                                    {p.seller_id?.username?.[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{p.seller_id?.username || "Trusted Seller"}</p>
                                    <p className="text-gray-500 text-sm italic">"{p.message}"</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                  <div className="text-green-600 font-black text-xl">₹{p.price}</div>
                                  {p.status === "Pending" && req.status === "Open" ? (
                                    <button onClick={() => handleAcceptProposal(req._id, p._id)} className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-green-700 hover:scale-105 transition shadow-lg shadow-green-100 dark:shadow-none flex items-center gap-2">
                                      Accept <ChevronRight size={16} />
                                    </button>
                                  ) : (
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${p.status === 'Accepted' ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                                      {p.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
