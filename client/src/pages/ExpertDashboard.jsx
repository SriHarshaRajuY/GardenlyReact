// src/pages/ExpertDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ExpertDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "expert") navigate("/signin");
    fetchTickets();
  }, [user, navigate]);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets/expert", {
        headers: { "Authorization": `Bearer ${document.cookie.split("; ").find(row => row.startsWith("access_token="))?.split("=")[1]}` },
      });
      if (res.ok) setTickets(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const viewTicket = async (id) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        headers: { "Authorization": `Bearer ${document.cookie.split("; ").find(row => row.startsWith("access_token="))?.split("=")[1]}` },
      });
      if (res.ok) setSelectedTicket(await res.json());
      setActiveSection("ticketDetails");
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    const resolution = e.target.resolution.value;
    try {
      const res = await fetch(`/api/tickets/${selectedTicket._id}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${document.cookie.split("; ").find(row => row.startsWith("access_token="))?.split("=")[1]}`,
        },
        body: JSON.stringify({ resolution }),
      });
      if (res.ok) {
        alert("Resolved");
        fetchTickets();
        setActiveSection("tickets");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeTickets = tickets.filter(t => t.status === "Open").length;
  const resolvedToday = tickets.filter(t => t.status === "Resolved" && new Date(t.resolved_at).toDateString() === new Date().toDateString()).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Nav */}
        <nav className="flex gap-4 mb-8 text-green-600 dark:text-green-400">
          <button onClick={() => setActiveSection("dashboard")}>Dashboard</button>
          <button onClick={() => setActiveSection("tickets")}>Tickets</button>
        </nav>

        {/* Dashboard */}
        {activeSection === "dashboard" && (
          <div>
            <h1 className="text-3xl font-bold mb-4 dark:text-white">Welcome, {user.username}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
                <h3 className="font-bold">Active Tickets</h3>
                <p className="text-2xl text-green-600">{activeTickets}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
                <h3 className="font-bold">Resolved Today</h3>
                <p className="text-2xl text-green-600">{resolvedToday}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
                <h3 className="font-bold">Total Assigned</h3>
                <p className="text-2xl text-green-600">{tickets.length}</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Recent Tickets</h2>
            <table className="w-full bg-white dark:bg-gray-800 rounded shadow mb-8">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-2">ID</th>
                  <th className="p-2">Requester</th>
                  <th className="p-2">Subject</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 5).map(ticket => (
                  <tr key={ticket._id}>
                    <td className="p-2">{ticket._id}</td>
                    <td className="p-2">{ticket.requester}</td>
                    <td className="p-2">{ticket.subject}</td>
                    <td className="p-2">{ticket.status}</td>
                    <td className="p-2"><button onClick={() => viewTicket(ticket._id)} className="text-green-600">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* All Tickets */}
        {activeSection === "tickets" && (
          <div>
            <h1 className="text-3xl font-bold mb-4 dark:text-white">All Tickets</h1>
            <table className="w-full bg-white dark:bg-gray-800 rounded shadow">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-2">ID</th>
                  <th className="p-2">Requester</th>
                  <th className="p-2">Subject</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket._id}>
                    <td className="p-2">{ticket._id}</td>
                    <td className="p-2">{ticket.requester}</td>
                    <td className="p-2">{ticket.subject}</td>
                    <td className="p-2">{ticket.type}</td>
                    <td className="p-2">{ticket.status}</td>
                    <td className="p-2"><button onClick={() => viewTicket(ticket._id)} className="text-green-600">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Ticket Details */}
        {activeSection === "ticketDetails" && selectedTicket && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h1 className="text-3xl font-bold mb-4 dark:text-white">Ticket Details</h1>
            <p><strong>ID:</strong> {selectedTicket._id}</p>
            <p><strong>Requester:</strong> {selectedTicket.requester}</p>
            <p><strong>Subject:</strong> {selectedTicket.subject}</p>
            <p><strong>Type:</strong> {selectedTicket.type}</p>
            <p><strong>Description:</strong> {selectedTicket.description}</p>
            <p><strong>Status:</strong> {selectedTicket.status}</p>
            {selectedTicket.attachment && <img src={selectedTicket.attachment} alt="Attachment" className="max-w-full mt-4" />}
            {selectedTicket.status === "Resolved" ? (
              <div>
                <h2 className="text-2xl font-bold mt-6 dark:text-white">Resolution</h2>
                <p>{selectedTicket.resolution}</p>
                <p><strong>Resolved At:</strong> {new Date(selectedTicket.resolved_at).toLocaleString()}</p>
              </div>
            ) : (
              <form onSubmit={handleResolve} className="mt-6">
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Provide Resolution</h2>
                <textarea name="resolution" required className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" rows="4" />
                <div className="flex gap-4 mt-4">
                  <button type="button" onClick={() => setActiveSection("tickets")} className="bg-gray-300 p-2 rounded">Cancel</button>
                  <button type="submit" className="bg-green-600 text-white p-2 rounded">Send</button>
                </div>
              </form>
            )}
            <button onClick={() => { setSelectedTicket(null); setActiveSection("tickets"); }} className="bg-green-600 text-white p-2 rounded mt-4">Back</button>
          </div>
        )}
      </div>
    </div>
  );
}