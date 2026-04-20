import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Upload,
  CheckCircle,
  Clock,
  ArrowLeft,
  Leaf,
  Bug,
  Wrench,
  Send,
  Download,
  Flower2,
  MessageSquare,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function ExpertSupport() {
  const [view, setView] = useState("home");
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/tickets/user", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.log("No tickets yet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "tickets") fetchTickets();
  }, [view]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/tickets/submit", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message || "Ticket submitted! Our expert will reply soon");
        e.target.reset();
        setView("tickets");
        fetchTickets();
      } else {
        alert(result.message || "Something went wrong");
      }
    } catch (err) {
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "general": return <Leaf className="w-6 h-6 text-green-600" />;
      case "technical": return <Bug className="w-6 h-6 text-red-600" />;
      case "billing": return <Wrench className="w-6 h-6 text-blue-600" />;
      default: return <Leaf className="w-6 h-6 text-green-600" />;
    }
  };

  const downloadResolution = () => {
    if (!selectedTicket?.resolution) return;
    const blob = new Blob([selectedTicket.resolution], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plant-care-advice-${selectedTicket._id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] dark:bg-gray-950 pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black text-green-900 dark:text-green-400 leading-tight">
              Expert <span className="text-green-600">Care</span> <br /> For Your Plants
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-lg">
              Get personalized advice from certified botanists and gardening experts to help your green friends thrive.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-green-100 dark:border-green-900/30 flex flex-col items-center text-center w-40">
                <ShieldCheck className="w-10 h-10 text-green-600 mb-2" />
                <span className="text-sm font-bold">Verified Experts</span>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-green-100 dark:border-green-900/30 flex flex-col items-center text-center w-40">
                <Zap className="w-10 h-10 text-amber-500 mb-2" />
                <span className="text-sm font-bold">Fast Response</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center md:justify-start gap-4 mb-12 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border dark:border-gray-800 w-fit">
          {["home", "submit", "tickets"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                (view === v || (v === "tickets" && view === "detail"))
                  ? "bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none"
                  : "text-gray-500 hover:text-green-600 dark:hover:text-green-400"
              }`}
            >
              {v === "home" ? "Overview" : v === "submit" ? "New Ticket" : "My History"}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {view === "home" && (
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-[2.5rem] p-12 text-white flex flex-col justify-between">
                    <div>
                        <MessageSquare className="w-16 h-16 mb-6 opacity-80" />
                        <h2 className="text-4xl font-bold mb-4">Have a plant emergency?</h2>
                        <p className="text-green-100 text-lg mb-8">Whether it's yellowing leaves or mysterious pests, our experts are here to diagnose and cure.</p>
                    </div>
                    <button onClick={() => setView("submit")} className="bg-white text-green-700 px-10 py-4 rounded-2xl font-black text-xl hover:scale-105 transition shadow-xl">
                        Start Consultation
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border dark:border-gray-800 shadow-sm">
                        <h3 className="text-xl font-bold mb-2">Check Progress</h3>
                        <p className="text-gray-500 mb-4">View updates on your existing support tickets and expert advice.</p>
                        <button onClick={() => setView("tickets")} className="text-green-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                            View My Tickets <ArrowLeft className="rotate-180 w-5 h-5" />
                        </button>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border dark:border-gray-800 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Bug className="w-8 h-8 text-amber-600" />
                        </div>
                        <div>
                            <h4 className="font-bold">Pest Identification</h4>
                            <p className="text-sm text-gray-500">Upload photos for instant AI-assisted pest detection (coming soon).</p>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {view === "submit" && (
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 md:p-16 shadow-2xl border dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-center mb-10">Consult an Expert</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold mb-2 ml-1">Subject</label>
                    <input name="subject" required className="w-full px-6 py-4 rounded-2xl border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none transition" placeholder="e.g. My Fiddle Leaf Fig is dropping leaves" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 ml-1">Category</label>
                        <select name="type" required className="w-full px-6 py-4 rounded-2xl border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none">
                            <option value="general">General Care</option>
                            <option value="technical">Pests & Diseases</option>
                            <option value="billing">Orders & Payment</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 ml-1">Urgency</label>
                        <select name="urgency" className="w-full px-6 py-4 rounded-2xl border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none">
                            <option value="Normal (24h)">Normal (24h)</option>
                            <option value="High (12h)">High (12h)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 ml-1">Description</label>
                    <textarea name="description" required rows={6} className="w-full px-6 py-4 rounded-2xl border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none resize-none" placeholder="Provide as much detail as possible about watering, light, and symptoms..." />
                </div>

                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] p-8 text-center hover:border-green-500 transition cursor-pointer bg-gray-50 dark:bg-gray-800/50">
                    <label className="cursor-pointer block">
                        <Upload className="w-10 h-10 mx-auto text-green-600 mb-2" />
                        <p className="font-bold">Attach Photos</p>
                        <p className="text-xs text-gray-500 mt-1">Images help our experts diagnose better</p>
                        <input type="file" name="attachment" accept="image/*" className="hidden" />
                    </label>
                </div>

                <button type="submit" disabled={loading} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-green-200 dark:shadow-none hover:bg-green-700 transition disabled:opacity-50">
                    {loading ? "Submitting..." : "Send Request"}
                </button>
              </form>
            </div>
          )}

          {view === "tickets" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">Your Consultation History</h2>
              {loading ? (
                <div className="py-20 text-center text-gray-400">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-20 text-center border dark:border-gray-800">
                    <Flower2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">No support tickets found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {tickets.map((t) => (
                    <div key={t._id} onClick={() => { setSelectedTicket(t); setView("detail"); }} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border dark:border-gray-800 hover:border-green-500 transition cursor-pointer flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                                {getIcon(t.type)}
                            </div>
                            <div>
                                <h4 className="font-bold group-hover:text-green-600 transition">{t.subject}</h4>
                                <p className="text-sm text-gray-500">{format(new Date(t.createdAt), "MMM dd, yyyy")}</p>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${t.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {t.status}
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === "detail" && selectedTicket && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <button onClick={() => setView("tickets")} className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-green-600 transition">
                    <ArrowLeft size={20} /> Back to History
                </button>
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border dark:border-gray-800">
                    <div className="bg-green-600 p-10 text-white">
                        <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4 inline-block">{selectedTicket.type}</span>
                        <h2 className="text-3xl font-bold">{selectedTicket.subject}</h2>
                    </div>
                    <div className="p-10 space-y-10">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2rem]">
                            <h4 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest">Your Inquiry</h4>
                            <p className="text-lg leading-relaxed">{selectedTicket.description}</p>
                            {selectedTicket.attachment && (
                                <img src={selectedTicket.attachment} className="mt-6 rounded-2xl border dark:border-gray-700 max-h-96 object-cover" alt="Attachment" />
                            )}
                        </div>

                        {selectedTicket.resolution ? (
                            <div className="relative pt-8">
                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-200 to-transparent"></div>
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200">
                                        <ShieldCheck className="text-white w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xl font-bold text-green-800 dark:text-green-400">Expert Advice</h4>
                                            <button onClick={downloadResolution} className="p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition text-green-600">
                                                <Download size={24} />
                                            </button>
                                        </div>
                                        <div className="prose dark:prose-invert max-w-none">
                                            <p className="text-lg leading-relaxed whitespace-pre-wrap">{selectedTicket.resolution}</p>
                                        </div>
                                        <p className="mt-6 text-sm text-gray-400 font-medium">Resolution provided on {format(new Date(selectedTicket.resolved_at), "MMM dd, yyyy")}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/30">
                                <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
                                <h4 className="font-bold text-amber-800 dark:text-amber-400">Pending Expert Review</h4>
                                <p className="text-sm text-amber-600/80">Our botanist will respond within 24 hours.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}