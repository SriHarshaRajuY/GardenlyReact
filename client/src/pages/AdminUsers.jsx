import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users", {
          credentials: "include", // IMPORTANT (sends cookie)
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load users");
          setLoading(false);
          return;
        }

        setUsers(data.users);
        setLoading(false);
      } catch (err) {
        setError("Server error");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p className="text-gray-600">Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white border rounded-xl shadow-sm">
      <div className="p-5 border-b">
        <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
        <p className="text-sm text-gray-500">
          Manage all registered users in the system
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left">Username</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Mobile</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Expertise</th>
              <th className="px-5 py-3 text-left">Joined</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-10 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{u.username}</td>
                  <td className="px-5 py-3">{u.email}</td>
                  <td className="px-5 py-3">{u.mobile}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">{u.expertise || "-"}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}