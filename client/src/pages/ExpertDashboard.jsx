// src/pages/ExpertDashboard.jsx
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Leaf,
  Bug,
  Wrench,
  Clock,
  CheckCircle,
  Send,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function ExpertDashboard() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [view, setView] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets/expert", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const viewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setView("detail");
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    const resolution = e.target.resolution.value.trim();
    if (!resolution) return alert("Please write a resolution");

    try {
      const res = await fetch(`/api/tickets/${selectedTicket._id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution }),
        credentials: "include",
      });

      if (res.ok) {
        alert("Ticket resolved successfully!");
        e.target.reset();
        fetchTickets();
        setView("tickets");
      } else {
        alert("Failed to resolve ticket");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "general":
        return <Leaf className="w-8 h-8 text-green-600" />;
      case "technical":
        return <Bug className="w-8 h-8 text-red-600" />;
      case "billing":
        return <Wrench className="w-8 h-8 text-blue-600" />;
      default:
        return <Leaf className="w-8 h-8 text-green-600" />;
    }
  };

  const activeCount = tickets.filter((t) => t.status === "Open").length;
  const todayResolved = tickets.filter(
    (t) =>
      t.status === "Resolved" &&
      new Date(t.resolved_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-600 rounded-full mb-8">
            <Sparkles className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-green-800">
            Expert Dashboard
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-green-700 font-medium">
            Help gardeners grow healthier, happier plants
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Clock, label: "Active Tickets", value: activeCount },
            { icon: CheckCircle, label: "Resolved Today", value: todayResolved },
            { icon: Leaf, label: "Total Assigned", value: tickets.length },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-green-50 rounded-3xl p-10 text-center border-2 border-green-200"
            >
              <stat.icon className="w-20 h-20 text-green-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800">{stat.label}</h3>
              <p className="text-7xl font-extrabold text-green-700 mt-6">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-8 mb-16">
          <button
            onClick={() => setView("dashboard")}
            className={`px-12 py-5 rounded-full font-bold text-xl transition-all ${
              view === "dashboard"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView("tickets")}
            className={`px-12 py-5 rounded-full font-bold text-xl transition-all ${
              view === "tickets" || view === "detail"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Tickets
          </button>
        </div>

        {/* Dashboard View */}
        {view === "dashboard" && (
          <div className="space-y-10">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-green-800">Recent Tickets</h2>
            {tickets.length === 0 ? (
              <div className="text-center py-32 bg-green-50 rounded-3xl border-2 border-green-200">
                <Leaf className="w-32 h-32 text-green-500 mx-auto mb-8" />
                <p className="text-3xl font-medium text-green-700">No tickets assigned yet. Enjoy the calm!</p>
              </div>
            ) : (
              <div className="grid gap-8">
                {tickets.slice(0, 6).map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => viewTicket(ticket)}
                    className="bg-white rounded-3xl border-2 border-green-300 p-10 hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900">
                          {ticket.subject}
                        </h3>
                        <p className="text-xl text-green-700 font-medium mt-3">From: {ticket.requester}</p>
                      </div>
                      <span className={`px-8 py-4 rounded-full font-bold text-lg ${
                        ticket.status === "Open"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {ticket.status === "Open" ? "Pending" : "Resolved"}
                      </span>
                    </div>
                    <div className="flex items-center gap-8 text-lg">
                      {getTypeIcon(ticket.type)}
                      <span className="font-semibold capitalize text-green-800">{ticket.type}</span>
                      <span className="text-gray-600">• {format(new Date(ticket.createdAt), "dd MMM yyyy")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Tickets View */}
        {view === "tickets" && (
          <div>
            <h2 className="text-5xl font-bold text-center text-green-800 mb-12">All Assigned Tickets</h2>
            {loading ? (
              <p className="text-center text-2xl text-green-700 py-20">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="text-center text-3xl text-green-600 py-32">No tickets yet</p>
            ) : (
              <div className="space-y-8">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => viewTicket(ticket)}
                    className="bg-white rounded-3xl border-2 border-green-300 p-10 hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-3xl font-bold text-gray-900">
                        {ticket.subject}
                      </h3>
                      <span className={`px-10 py-4 rounded-full font-bold text-xl ${
                        ticket.status === "Open"
                          ? "bg-amber-500 text-white"
                          : "bg-green-600 text-white"
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-lg mb-6 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center justify-between text-green-700">
                      <div className="flex items-center gap-8">
                        {getTypeIcon(ticket.type)}
                        <span className="font-medium text-xl">{ticket.requester}</span>
                      </div>
                      <span className="text-lg">
                        {format(new Date(ticket.createdAt), "dd MMM yyyy, hh:mm a")}
                      </span>
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
              className="flex items-center gap-4 text-green-700 hover:text-green-800 font-bold text-xl mb-10 transition"
            >
              <ArrowLeft className="w-8 h-8" /> Back to Tickets
            </button>

            <div className="bg-white rounded-3xl border-2 border-green-300 overflow-hidden">
              <div className="bg-green-600 text-white p-12">
                <h2 className="text-4xl md:text-5xl font-bold">{selectedTicket.subject}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 text-green-100 text-lg">
                  <div><strong>From:</strong> {selectedTicket.requester}</div>
                  <div><strong>Type:</strong> {selectedTicket.type.toUpperCase()}</div>
                  <div><strong>Date:</strong> {format(new Date(selectedTicket.createdAt), "dd MMM yyyy")}</div>
                </div>
              </div>

              <div className="p-12 space-y-12">
                <div>
                  <h3 className="text-3xl font-bold text-green-800 mb-8">Customer's Question</h3>
                  <div className="bg-green-50 rounded-3xl p-10 border-2 border-green-200">
                    <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                    {selectedTicket.attachment && (
                      <img
                        src={selectedTicket.attachment}
                        alt="Customer uploaded"
                        className="mt-10 w-full max-w-3xl mx-auto rounded-2xl border-8 border-white shadow-2xl"
                      />
                    )}
                  </div>
                </div>

                {selectedTicket.status === "Open" ? (
                  <div className="bg-green-50 rounded-3xl p-12 border-4 border-dashed border-green-300">
                    <h3 className="text-4xl font-bold text-center text-green-800 mb-10">
                      Send Your Expert Advice
                    </h3>
                    <form onSubmit={handleResolve} className="space-y-8">
                      <textarea
                        name="resolution"
                        required
                        rows={10}
                        className="w-full px-10 py-8 text-xl rounded-3xl border-2 border-green-300 focus:border-green-600 outline-none resize-none font-medium"
                        placeholder="Share your expert diagnosis, treatment plan, and care tips..."
                      />
                      <div className="text-center">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-5 px-20 py-7 bg-green-600 text-white text-2xl font-bold rounded-full hover:bg-green-700 transition"
                        >
                          <Send className="w-9 h-9" />
                          Send Resolution
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-3xl p-16 text-center border-4 border-green-300">
                    <CheckCircle className="w-32 h-32 text-green-600 mx-auto mb-8" />
                    <h3 className="text-4xl font-bold text-green-800 mb-8">Ticket Resolved</h3>
                    <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap max-w-4xl mx-auto">
                      {selectedTicket.resolution}
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