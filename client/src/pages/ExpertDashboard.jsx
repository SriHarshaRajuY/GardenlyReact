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
} from "lucide-react";

export default function ExpertDashboard() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [view, setView] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // Fetch all tickets assigned to this expert
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
      const res = await fetch(
        `/api/tickets/${selectedTicket._id}/resolve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolution }),
          credentials: "include",
        }
      );

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
        return <Leaf className="w-6 h-6 text-green-600" />;
      case "technical": // plant disease / pest
        return <Bug className="w-6 h-6 text-red-600" />;
      case "billing": // order / payment
        return <Wrench className="w-6 h-6 text-blue-600" />;
      default:
        return <Leaf className="w-6 h-6" />;
    }
  };

  const activeCount = tickets.filter((t) => t.status === "Open").length;
  const todayResolved = tickets.filter(
    (t) =>
      t.status === "Resolved" &&
      new Date(t.resolved_at).toDateString() ===
        new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Expert Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Help gardeners grow happier, healthier plants
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">
              Active Tickets
            </h3>
            <p className="text-5xl font-bold text-yellow-600 mt-4">
              {activeCount}
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">
              Resolved Today
            </h3>
            <p className="text-5xl font-bold text-green-600 mt-4">
              {todayResolved}
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition">
            <Leaf className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">
              Total Assigned
            </h3>
            <p className="text-5xl font-bold text-emerald-600 mt-4">
              {tickets.length}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-6 mb-10">
          <button
            onClick={() => setView("dashboard")}
            className={`px-10 py-4 rounded-full font-bold text-lg transition-all ${
              view === "dashboard"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-green-50"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView("tickets")}
            className={`px-10 py-4 rounded-full font-bold text-lg transition-all ${
              view === "tickets" || view === "detail"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-green-50"
            }`}
          >
            All Tickets
          </button>
        </div>

        {/* DASHBOARD VIEW - Recent Tickets */}
        {view === "dashboard" && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Recent Tickets
            </h2>
            {tickets.length === 0 ? (
              <p className="text-center text-2xl text-gray-500 py-20">
                No tickets assigned yet. Enjoy the calm!
              </p>
            ) : (
              <div className="grid gap-6">
                {tickets.slice(0, 6).map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => viewTicket(ticket)}
                    className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition cursor-pointer border-l-8 border-green-500"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {ticket.subject}
                        </h3>
                        <p className="text-gray-600 mt-2">
                          From: <strong>{ticket.requester}</strong>
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                          {getTypeIcon(ticket.type)}
                          <span className="text-lg capitalize font-medium">
                            {ticket.type}
                          </span>
                          <span className="text-gray-500">
                            •{" "}
                            {format(
                              new Date(ticket.createdAt),
                              "dd MMM yyyy"
                            )}
                          </span>
                        </div>
                      </div>
                      {ticket.status === "Open" ? (
                        <span className="px-6 py-3 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                          Pending
                        </span>
                      ) : (
                        <span className="px-6 py-3 bg-green-100 text-green-800 rounded-full font-bold">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALL TICKETS VIEW */}
        {view === "tickets" && (
          <div>
            <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">
              All Assigned Tickets
            </h2>
            {loading ? (
              <p className="text-center text-xl text-gray-600">
                Loading tickets...
              </p>
            ) : tickets.length === 0 ? (
              <p className="text-center text-2xl text-gray-500 py-20">
                No tickets yet
              </p>
            ) : (
              <div className="grid gap-6">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => viewTicket(ticket)}
                    className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition cursor-pointer border-l-8 border-green-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {ticket.subject}
                      </h3>
                      {ticket.status === "Open" ? (
                        <span className="px-5 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold text-lg">
                          Open
                        </span>
                      ) : (
                        <span className="px-5 py-2 bg-green-100 text-green-800 rounded-full font-bold text-lg">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4">
                      {ticket.description.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between text-gray-600">
                      <div className="flex items-center gap-6">
                        {getTypeIcon(ticket.type)}
                        <span className="font-medium">
                          {ticket.requester}
                        </span>
                      </div>
                      <span>
                        {format(
                          new Date(ticket.createdAt),
                          "dd MMM yyyy, hh:mm a"
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TICKET DETAIL & RESOLVE */}
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
                <h2 className="text-3xl font-bold">
                  {selectedTicket.subject}
                </h2>
                <div className="flex items-center gap-8 mt-6 text-green-100">
                  <span>
                    <strong>From:</strong> {selectedTicket.requester}
                  </span>
                  <span>
                    <strong>Type:</strong>{" "}
                    {selectedTicket.type.toUpperCase()}
                  </span>
                  <span>
                    <strong>Date:</strong>{" "}
                    {format(
                      new Date(selectedTicket.createdAt),
                      "dd MMM yyyy"
                    )}
                  </span>
                </div>
              </div>

              <div className="p-10 space-y-10">
                {/* Customer Message */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Customer&apos;s Question
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-8">
                    <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                    {selectedTicket.attachment && (
                      <img
                        src={selectedTicket.attachment}
                        alt="Customer uploaded"
                        className="mt-8 max-w-full rounded-2xl shadow-lg border-4 border-gray-200"
                      />
                    )}
                  </div>
                </div>

                {/* Resolution Form */}
                {selectedTicket.status === "Open" ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-10 border-4 border-green-200">
                    <h3 className="text-3xl font-bold text-green-800 mb-8 text-center">
                      Send Your Expert Advice
                    </h3>
                    <form onSubmit={handleResolve} className="space-y-6">
                      <textarea
                        name="resolution"
                        required
                        rows={6}
                        className="w-full px-8 py-6 text-lg border-2 border-gray-300 rounded-2xl focus:border-green-500 focus:outline-none resize-none"
                        placeholder="Share your expert advice... Suggest solutions, care tips, or next steps."
                      />
                      <div className="flex justify-center">
                        <button
                          type="submit"
                          className="px-12 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-full hover:from-green-700 hover:to-emerald-700 transition flex items-center gap-4 shadow-lg"
                        >
                          <Send className="w-6 h-6" /> Send Resolution
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-green-50 border-4 border-green-300 rounded-3xl p-10 text-center">
                    <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold text-green-800 mb-4">
                      Ticket Already Resolved
                    </h3>
                    <p className="text-xl text-gray-700 whitespace-pre-wrap">
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
