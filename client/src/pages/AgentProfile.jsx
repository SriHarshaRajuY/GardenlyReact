// client/src/pages/AgentProfile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes } from "react-icons/fa";

export default function AgentProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Protect route
  useEffect(() => {
    if (!user || user.role !== "DeliveryAgent") {
      navigate("/signin");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/user/me", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setProfile(data.user);
          setEditData(data.user);
        } else {
          setError(data.message || "Failed to load profile");
        }
      } catch (err) {
        setError("Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profile);
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: editData.mobile,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setIsEditing(false);
        setError("");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Error updating profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Agent Profile</h1>
              <p className="text-gray-600 mt-1">🚚 Delivery Agent</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/signin");
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {profile && (
            <div className="space-y-6">
              {/* Username */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaUser className="text-[#38d39f] text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="text-lg font-semibold text-gray-800">{profile.username}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaEnvelope className="text-[#38d39f] text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold text-gray-800">{profile.email}</p>
                </div>
              </div>

              {/* Mobile - Editable */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaPhone className="text-[#38d39f] text-xl" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Mobile Number</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.mobile}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      maxLength="10"
                      className="text-lg font-semibold text-gray-800 bg-white border border-[#38d39f] rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">{profile.mobile}</p>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="px-3 py-1 bg-[#38d39f] text-white rounded-full text-sm font-semibold">
                  {profile.role}
                </span>
                <div>
                  <p className="text-sm text-gray-600">Account Type</p>
                  <p className="text-lg font-semibold text-gray-800">Delivery Professional</p>
                </div>
              </div>

              {/* Edit/Save Buttons */}
              <div className="flex gap-4 pt-4">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#38d39f] text-white rounded-lg hover:bg-[#2db88a] transition font-semibold"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                    >
                      <FaSave /> Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-semibold"
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
