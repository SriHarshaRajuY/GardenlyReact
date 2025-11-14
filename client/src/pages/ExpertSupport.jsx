// src/pages/ExpertSupport.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Static KB articles (from old EJS)
const articles = {
  "order-status": {
    title: "Order Status",
    modifiedDate: "Fri, 10 Jun, 2022 at 4:13 PM",
    content: `
      <p>You can check the status of your order by logging into your account and visiting the 'My Orders' section.</p>
      <p>Order statuses include: Pending, Processing, Shipped, and Delivered.</p>
      <ul>
        <li><strong>Pending:</strong> Order received, awaiting processing</li>
        <li><strong>Processing:</strong> Order is being prepared for shipment</li>
        <li><strong>Shipped:</strong> Order has been dispatched</li>
        <li><strong>Delivered:</strong> Order has been successfully delivered</li>
      </ul>
    `,
  },
  // Add more articles similarly from old EJS...
  // e.g., 'cancel-refund', 'damage-product', etc.
};

export default function ExpertSupport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "buyer") navigate("/signin");
    fetchTickets();
  }, [user, navigate]);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets/user", {
        headers: { "Authorization": `Bearer ${document.cookie.split("; ").find(row => row.startsWith("access_token="))?.split("=")[1]}` },
      });
      if (res.ok) setTickets(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const res = await fetch("/api/tickets/submit", {
        method: "POST",
        body: formData,
        headers: { "Authorization": `Bearer ${document.cookie.split("; ").find(row => row.startsWith("access_token="))?.split("=")[1]}` },
      });
      if (res.ok) {
        alert("Ticket submitted");
        fetchTickets();
        setActiveSection("messages");
      }
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
      setActiveSection("ticket");
    } catch (err) {
      console.error(err);
    }
  };

  const viewArticle = (key) => {
    setSelectedArticle(articles[key]);
    setActiveSection("article");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Nav */}
        <nav className="flex gap-4 mb-8 text-green-600 dark:text-green-400">
          <button onClick={() => setActiveSection("home")}>Home</button>
          <button onClick={() => setActiveSection("knowledgeBase")}>Knowledge Base</button>
          <button onClick={() => setActiveSection("ticket")}>Submit Ticket</button>
          <button onClick={() => setActiveSection("messages")}>Messages</button>
        </nav>

        {/* Home Section */}
        {activeSection === "home" && (
          <div>
            <h1 className="text-3xl font-bold mb-4 dark:text-white">Hi, how can we help you?</h1>
            <div className="flex mb-6">
              <input type="text" placeholder="Search..." className="flex-1 p-2 border rounded-l dark:bg-gray-800 dark:text-white" />
              <button className="bg-green-600 text-white p-2 rounded-r">🔍</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow cursor-pointer" onClick={() => setActiveSection("knowledgeBase")}>
                <h3 className="font-bold">Browse articles</h3>
                <p>Explore How-To's and best practices</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow cursor-pointer" onClick={() => setActiveSection("ticket")}>
                <h3 className="font-bold">Submit a ticket</h3>
                <p>Describe your issue</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Popular articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(articles).map(key => (
                <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded shadow cursor-pointer" onClick={() => viewArticle(key)}>
                  <h4 className="font-bold">{articles[key].title}</h4>
                  <p className="text-sm text-gray-500">{articles[key].modifiedDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Knowledge Base */}
        {activeSection === "knowledgeBase" && (
          <div>
            <h1 className="text-3xl font-bold mb-4 dark:text-white">Knowledge Base</h1>
            {/* Add categories and lists from old EJS, static */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h2 className="font-bold">General</h2>
                <ul>
                  <li onClick={() => viewArticle("order-status")} className="cursor-pointer text-green-600">Order Status</li>
                  {/* Add more */}
                </ul>
              </div>
              {/* Add more categories */}
            </div>
          </div>
        )}

        {/* Submit Ticket */}
        {activeSection === "ticket" && !selectedTicket && (
          <div>
            <h1 className="text-3xl font-bold mb-4 dark:text-white">Submit a Ticket</h1>
            <form onSubmit={handleSubmitTicket} className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <div className="mb-4">
                <label className="block mb-1 dark:text-white">Requester</label>
                <input name="requester" value={user.username} readOnly className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 dark:text-white">Subject *</label>
                <input name="subject" required className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 dark:text-white">Type</label>
                <select name="type" required className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
                  <option value="">Choose...</option>
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 dark:text-white">Description *</label>
                <textarea name="description" required className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" rows="4" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 dark:text-white">Attachment</label>
                <input type="file" name="attachment" accept="image/*" className="w-full" />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setActiveSection("home")} className="bg-gray-300 p-2 rounded">Cancel</button>
                <button type="submit" className="bg-green-600 text-white p-2 rounded">Submit</button>
              </div>
            </form>
          </div>
        )}

        {/* View Ticket Details */}
        {activeSection === "ticket" && selectedTicket && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h1 className="text-3xl font-bold mb-4 dark:text-white">Ticket Details</h1>
            <p><strong>ID:</strong> {selectedTicket._id}</p>
            <p><strong>Subject:</strong> {selectedTicket.subject}</p>
            <p><strong>Type:</strong> {selectedTicket.type}</p>
            <p><strong>Description:</strong> {selectedTicket.description}</p>
            <p><strong>Status:</strong> {selectedTicket.status}</p>
            {selectedTicket.attachment && <img src={selectedTicket.attachment} alt="Attachment" className="max-w-full mt-4" />}
            {selectedTicket.resolution && (
              <>
                <p><strong>Resolution:</strong> {selectedTicket.resolution}</p>
                <p><strong>Resolved At:</strong> {new Date(selectedTicket.resolved_at).toLocaleString()}</p>
              </>
            )}
            <button onClick={() => { setSelectedTicket(null); setActiveSection("messages"); }} className="bg-green-600 text-white p-2 rounded mt-4">Back</button>
          </div>
        )}

        {/* Messages (Tickets List) */}
        {activeSection === "messages" && (
          <div>
            <h1 className="text-3xl font-bold mb-4 dark:text-white">Your Messages</h1>
            <table className="w-full bg-white dark:bg-gray-800 rounded shadow">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-2">ID</th>
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

        {/* Article View */}
        {activeSection === "article" && selectedArticle && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">{selectedArticle.title}</h1>
            <p className="text-sm text-gray-500 mb-4">{selectedArticle.modifiedDate}</p>
            <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} className="prose dark:prose-invert" />
            <button onClick={() => { setSelectedArticle(null); setActiveSection("home"); }} className="bg-green-600 text-white p-2 rounded mt-4">Back</button>
          </div>
        )}
      </div>
    </div>
  );
}