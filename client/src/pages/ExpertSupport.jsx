// src/pages/ExpertSupport.jsx
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
} from "lucide-react";

export default function ExpertSupport() {
  const [view, setView] = useState("home");
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets/user", { credentials: "include" });
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
      const res = await fetch("/api/tickets/submit", {
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
      case "general": return <Leaf className="w-8 h-8 text-green-600" />;
      case "technical": return <Bug className="w-8 h-8 text-red-600" />;
      case "billing": return <Wrench className="w-8 h-8 text-blue-600" />;
      default: return <Leaf className="w-8 h-8 text-green-600" />;
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
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-600 rounded-full mb-8">
            <Flower2 className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-green-800">
            Expert Gardening Support
          </h1>
          <p className="mt-4 text-2xl text-green-700">
            Get personalized help from certified plant experts
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {["home", "submit", "tickets"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-10 py-4 rounded-full font-bold text-lg transition-all ${
                (view === v || (v === "tickets" && view === "detail"))
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {v === "home" ? "Home" : v === "submit" ? "New Ticket" : "My Tickets"}
            </button>
          ))}
        </div>

        {/* Home View */}
        {view === "home" && (
          <div className="text-center py-32 bg-green-50 rounded-3xl border-2 border-green-200">
            <h2 className="text-5xl font-bold text-green-800 mb-10">
              How can we help your plants today?
            </h2>
            <button
              onClick={() => setView("submit")}
              className="inline-flex items-center gap-4 px-20 py-10 bg-green-600 text-white text-3xl font-bold rounded-full hover:bg-green-700 transition"
            >
              <Leaf className="w-12 h-12" />
              Submit a New Ticket
            </button>
          </div>
        )}

        {/* Submit Ticket */}
        {view === "submit" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border-2 border-green-200 p-12">
              <h2 className="text-4xl md:text-5xl font-bold text-center text-green-800 mb-12">
                Tell Us About Your Plant
              </h2>
              <form onSubmit={handleSubmit} className="space-y-10">
                <input
                  name="subject"
                  required
                  className="w-full px-8 py-6 text-xl rounded-2xl border-2 border-green-300 focus:border-green-600 outline-none"
                  placeholder="e.g. Monstera leaves turning yellow"
                />

                <select
                  name="type"
                  required
                  className="w-full px-8 py-6 text-xl rounded-2xl border-2 border-green-300 focus:border-green-600 outline-none"
                >
                  <option value="general">General Gardening Question</option>
                  <option value="technical">Plant Disease / Pests</option>
                  <option value="billing">Order & Payment Issue</option>
                </select>

                <textarea
                  name="description"
                  required
                  rows={10}
                  className="w-full px-8 py-8 text-xl rounded-2xl border-2 border-green-300 focus:border-green-600 outline-none resize-none font-medium"
                  placeholder="Describe the issue in detail: plant type, symptoms, light, water, soil, when it started..."
                />

                <label className="block">
                  <div className="border-4 border-dashed border-green-300 rounded-3xl p-20 text-center hover:border-green-500 transition cursor-pointer">
                    <Upload className="w-24 h-24 mx-auto text-green-600 mb-6" />
                    <p className="text-2xl font-bold text-green-700">Upload Photo (Highly Recommended)</p>
                    <p className="text-green-600 mt-3">Click or drag image here • JPG/PNG up to 5MB</p>
                    <input type="file" name="attachment" accept="image/*" className="hidden" />
                  </div>
                </label>

                <div className="flex gap-8 pt-10">
                  <button
                    type="button"
                    onClick={() => setView("home")}
                    className="flex-1 py-6 border-2 border-green-300 rounded-2xl font-bold text-green-800 hover:bg-green-50 transition text-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-6 bg-green-600 text-white rounded-2xl font-bold text-2xl disabled:opacity-70 flex items-center justify-center gap-5 hover:bg-green-700 transition"
                  >
                    {loading ? "Submitting..." : (
                      <>
                        Submit Ticket <Send className="w-9 h-9" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Tickets */}
        {view === "tickets" && (
          <div>
            <h2 className="text-5xl font-bold text-center text-green-800 mb-16">My Support Tickets</h2>
            {loading ? (
              <p className="text-center text-2xl text-green-700 py-20">Loading your tickets...</p>
            ) : tickets.length === 0 ? (
              <div className="text-center py-32 bg-green-50 rounded-3xl border-2 border-green-200">
                <Leaf className="w-32 h-32 text-green-500 mx-auto mb-8" />
                <p className="text-3xl font-medium text-green-700 mb-10">No tickets submitted yet</p>
                <button
                  onClick={() => setView("submit")}
                  className="px-16 py-8 bg-green-600 text-white rounded-full text-2xl font-bold hover:bg-green-700"
                >
                  Create Your First Ticket
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => { setSelectedTicket(ticket); setView("detail"); }}
                    className="bg-white rounded-3xl border-2 border-green-300 p-10 hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-3xl font-bold text-green-800">
                          {ticket.subject}
                        </h3>
                        <div className="flex items-center gap-10 mt-6 text-xl text-green-700">
                          {getIcon(ticket.type)}
                          <span className="font-medium capitalize">
                            {ticket.type === "technical" ? "Pest/Disease" : ticket.type}
                          </span>
                          <span className="text-gray-600">
                            {format(new Date(ticket.createdAt), "dd MMM yyyy • hh:mm a")}
                          </span>
                        </div>
                      </div>
                      {ticket.status === "Resolved" ? (
                        <div className="text-green-600 font-bold text-3xl flex items-center gap-4">
                          <CheckCircle className="w-12 h-12" /> Resolved
                        </div>
                      ) : (
                        <div className="text-amber-600 font-bold text-3xl flex items-center gap-4">
                          <Clock className="w-12 h-12" /> Open
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ticket Detail */}
        {view === "detail" && selectedTicket && (
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => setView("tickets")}
              className="flex items-center gap-4 text-green-700 hover:text-green-800 font-bold text-xl mb-10"
            >
              <ArrowLeft className="w-8 h-8" /> Back to Tickets
            </button>

            <div className="bg-white rounded-3xl border-2 border-green-300 overflow-hidden">
              <div className="bg-green-600 text-white p-12">
                <h2 className="text-4xl md:text-5xl font-bold">{selectedTicket.subject}</h2>
                <p className="mt-6 text-green-100 text-xl">
                  Submitted on {format(new Date(selectedTicket.createdAt), "dd MMMM yyyy, hh:mm a")}
                </p>
              </div>

              <div className="p-12 space-y-12">
                <div>
                  <h3 className="text-3xl font-bold text-green-800 mb-8">Your Message</h3>
                  <div className="bg-green-50 rounded-3xl p-10 border-2 border-green-200">
                    <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                    {selectedTicket.attachment && (
                      <img
                        src={selectedTicket.attachment}
                        alt="Your plant"
                        className="mt-10 w-full rounded-2xl border-4 border-white shadow-lg"
                      />
                    )}
                  </div>
                </div>

                {selectedTicket.resolution ? (
                  <div className="bg-green-50 rounded-3xl p-12 border-4 border-green-300">
                    <div className="flex justify-between items-start mb-10">
                      <h3 className="text-4xl font-bold text-green-800">Expert Reply</h3>
                      <button
                        onClick={downloadResolution}
                        className="flex items-center gap-4 px-10 py-5 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 text-lg"
                      >
                        <Download className="w-7 h-7" /> Download Advice
                      </button>
                    </div>
                    <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.resolution}
                    </p>
                    <p className="text-green-700 font-bold text-lg mt-10">
                      Resolved on {format(new Date(selectedTicket.resolved_at), "dd MMMM yyyy, hh:mm a")}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-24 bg-amber-50 rounded-3xl border-4 border-amber-300">
                    <Clock className="w-32 h-32 text-amber-600 mx-auto mb-8" />
                    <p className="text-4xl font-bold text-amber-800">Our expert is reviewing your case</p>
                    <p className="text-2xl text-amber-700 mt-6">You’ll get a detailed reply within 24 hours</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}