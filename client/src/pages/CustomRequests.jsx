import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { PackageOpen, Send, CheckCircle, Clock } from "lucide-react";

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
      const url = user.role === "seller" ? "/api/custom-requests/open" : "/api/custom-requests/my-requests";
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
      const res = await fetch("/api/custom-requests", {
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
        alert("Request posted successfully!");
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
      const res = await fetch(`/api/custom-requests/${selectedRequest}/proposals`, {
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
        alert("Proposal submitted!");
      } else {
        alert(data.message || "Failed to submit proposal");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptProposal = async (requestId, proposalId) => {
    try {
      const res = await fetch(`/api/custom-requests/${requestId}/proposals/${proposalId}/accept`, {
        method: "PUT",
        credentials: "include"
      });
      if (res.ok) {
        fetchRequests();
        alert("Proposal accepted!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return <div className="pt-24 text-center">Please login to view custom requests.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <PackageOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Custom Requests</h1>
            <p className="text-gray-500">
              {user.role === "seller" ? "Browse buyer requirements and submit proposals." : "Post your custom plant or product requirements for sellers to bid on."}
            </p>
          </div>
        </div>

        {user.role !== "seller" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold mb-4">Post a New Requirement</h2>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">What do you need?</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Rare Monstera Albo cutting" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Budget (₹)</label>
                  <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 1500" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Details & Specifications</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the size, condition, and any specific requirements..." className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none min-h-[100px]"></textarea>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-green-700 transition">
                  <Send size={18} /> Post Requirement
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">
            {user.role === "seller" ? "Open Market Requirements" : "Your Requests"}
          </h2>
          
          {loading ? (
            <p>Loading...</p>
          ) : requests.length === 0 ? (
            <div className="bg-white p-8 rounded-xl text-center border text-gray-500">
              No requests found.
            </div>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{req.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Budget: <span className="font-semibold text-green-600">₹{req.budget || "Not specified"}</span>
                      <span className="mx-2">•</span>
                      Status: <span className={`font-medium ${req.status === 'Open' ? 'text-blue-500' : 'text-orange-500'}`}>{req.status}</span>
                    </p>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                    <Clock size={14} /> {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg mb-6 whitespace-pre-wrap">
                  {req.description}
                </p>

                {user.role === "seller" && req.status === "Open" && selectedRequest !== req._id && (
                  <button onClick={() => setSelectedRequest(req._id)} className="text-green-600 font-medium hover:underline">
                    + Submit a Proposal
                  </button>
                )}

                {selectedRequest === req._id && (
                  <form onSubmit={handleSubmitProposal} className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
                    <h4 className="font-bold text-green-800 mb-3">Your Proposal</h4>
                    <div className="grid md:grid-cols-4 gap-3 mb-3">
                      <div className="md:col-span-3">
                        <input type="text" required value={proposalMessage} onChange={(e) => setProposalMessage(e.target.value)} placeholder="Message to buyer (e.g. I can provide this within 3 days)" className="w-full p-2.5 border rounded-lg outline-none" />
                      </div>
                      <div>
                        <input type="number" required value={proposalPrice} onChange={(e) => setProposalPrice(e.target.value)} placeholder="Price (₹)" className="w-full p-2.5 border rounded-lg outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setSelectedRequest(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium">Submit</button>
                    </div>
                  </form>
                )}

                {/* Proposals List for Buyer */}
                {user.role !== "seller" && req.proposals && req.proposals.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-bold text-gray-800 mb-3">Received Proposals ({req.proposals.length})</h4>
                    <div className="space-y-3">
                      {req.proposals.map(p => (
                        <div key={p._id} className={`p-4 rounded-lg border flex justify-between items-center ${p.status === 'Accepted' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div>
                            <p className="font-medium text-gray-900">{p.seller_id?.username || "Unknown Seller"}</p>
                            <p className="text-gray-600 text-sm mt-1">{p.message}</p>
                            <p className="text-green-600 font-bold mt-1">₹{p.price}</p>
                          </div>
                          <div>
                            {p.status === "Pending" && req.status === "Open" ? (
                              <button onClick={() => handleAcceptProposal(req._id, p._id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1">
                                <CheckCircle size={16} /> Accept
                              </button>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === 'Accepted' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                {p.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
