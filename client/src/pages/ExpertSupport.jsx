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
} from "lucide-react";

export default function ExpertSupport() {
  const [view, setView] = useState("home");
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user's tickets
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

  // Submit ticket
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

  // Icon for ticket type
  const getIcon = (type) => {
    switch (type) {
      case "general":
        return <Leaf className="w-6 h-6 text-green-600" />;
      case "technical":
        return <Bug className="w-6 h-6 text-red-600" />;
      case "billing":
        return <Wrench className="w-6 h-6 text-blue-600" />;
      default:
        return <Leaf className="w-6 h-6" />;
    }
  };

  const downloadResolution = () => {
    if (!selectedTicket?.resolution) return;
    const blob = new Blob([selectedTicket.resolution], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-resolution-${selectedTicket._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Expert Gardening Support
          </h1>
          <p className="text-xl text-gray-600">
            Get personalized help from our certified plant experts
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-6 mb-12 flex-wrap">
          <button
            onClick={() => setView("home")}
            className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${
              view === "home"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-green-50"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setView("submit")}
            className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${
              view === "submit"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-green-50"
            }`}
          >
            New Ticket
          </button>
          <button
            onClick={() => setView("tickets")}
            className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${
              view === "tickets" || view === "detail"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-green-50"
            }`}
          >
            My Tickets
          </button>
        </div>

        {/* HOME VIEW */}
        {view === "home" && (
          <div className="text-center py-20">
            <h2 className="text-4xl font-bold mb-8">
              How can we help you today?
            </h2>
            <button
              onClick={() => setView("submit")}
              className="bg-green-600 text-white px-12 py-6 rounded-full text-2xl font-bold hover:bg-green-700 shadow-xl transition"
            >
              Submit a New Ticket
            </button>
          </div>
        )}

        {/* SUBMIT TICKET */}
        {view === "submit" && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
            <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">
              Tell Us Your Problem
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-lg font-semibold mb-3">
                  Subject *
                </label>
                <input
                  name="subject"
                  required
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none transition"
                  placeholder="e.g. Rose leaves turning yellow"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-3">
                  Issue Type *
                </label>
                <select
                  name="type"
                  required
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                >
                  <option value="general">General Gardening</option>
                  <option value="technical">Plant Disease / Pest</option>
                  <option value="billing">Order &amp; Payment Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-3">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={7}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none resize-none"
                  placeholder="Explain everything in detail..."
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-3">
                  Attach Photo (Optional but Helpful)
                </label>
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-green-500 transition cursor-pointer block">
                  <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG up to 5MB
                  </p>
                  <input
                    type="file"
                    name="attachment"
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex gap-6 pt-8">
                <button
                  type="button"
                  onClick={() => setView("home")}
                  className="flex-1 py-5 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold disabled:opacity-70 flex items-center justify-center gap-3 transition"
                >
                  {loading ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit Ticket <Send className="w-6 h-6" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MY TICKETS LIST */}
        {view === "tickets" && (
          <div>
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
              My Support Tickets
            </h2>
            {loading ? (
              <p className="text-center text-xl text-gray-600">Loading...</p>
            ) : tickets.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-600 mb-8">
                  No tickets submitted yet
                </p>
                <button
                  onClick={() => setView("submit")}
                  className="bg-green-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-green-700"
                >
                  Create Your First Ticket
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setView("detail");
                    }}
                    className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition cursor-pointer border-l-8 border-green-500"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {ticket.subject}
                        </h3>
                        <div className="flex items-center gap-6 mt-4 text-gray-600">
                          <span className="flex items-center gap-2">
                            {getIcon(ticket.type)}
                            <span className="capitalize">
                              {ticket.type}
                            </span>
                          </span>
                          <span>
                            {format(
                              new Date(ticket.createdAt),
                              "dd MMM yyyy • hh:mm a"
                            )}
                          </span>
                        </div>
                      </div>
                      {ticket.status === "Resolved" ? (
                        <span className="flex items-center gap-2 text-green-600 font-bold text-xl">
                          <CheckCircle className="w-7 h-7" /> Resolved
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-yellow-600 font-bold text-xl">
                          <Clock className="w-7 h-7" /> Open
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TICKET DETAIL */}
        {view === "detail" && selectedTicket && (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setView("tickets")}
              className="flex items-center gap-3 text-green-600 hover:text-green-700 mb-8 font-bold text-lg"
            >
              <ArrowLeft className="w-6 h-6" /> Back to Tickets
            </button>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-10">
                <h2 className="text-4xl font-bold">
                  {selectedTicket.subject}
                </h2>
                <p className="text-green-100 mt-4">
                  Submitted on{" "}
                  {format(
                    new Date(selectedTicket.createdAt),
                    "dd MMMM yyyy, hh:mm a"
                  )}
                </p>
              </div>

              <div className="p-10 space-y-10">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Your Message</h3>
                  <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                  {selectedTicket.attachment && (
                    <img
                      src={selectedTicket.attachment}
                      alt="Your photo"
                      className="mt-8 max-w-full rounded-2xl shadow-lg"
                    />
                  )}
                </div>

                {selectedTicket.resolution ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-300 rounded-3xl p-10">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-3xl font-bold text-green-800">
                        Expert Reply
                      </h3>
                      <button
                        onClick={downloadResolution}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700"
                      >
                        <Download className="w-5 h-5" /> Download
                      </button>
                    </div>
                    <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.resolution}
                    </p>
                    <p className="text-green-700 font-semibold mt-8">
                      Resolved on{" "}
                      {format(
                        new Date(selectedTicket.resolved_at),
                        "dd MMMM yyyy, hh:mm a"
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                    <p className="text-2xl text-gray-600">
                      Our expert is working on your case...
                    </p>
                    <p className="text-gray-500 mt-4">
                      You’ll get a reply within 24 hours
                    </p>
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
