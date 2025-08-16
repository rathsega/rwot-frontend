import React, { useEffect, useState } from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const DEFAULT_PROFILE = {
  id: null,
  name: "",
  role: "",
  company: "",
  email: "",
  phone: "",
};

export default function Profile() {
  const { token } = useAuth() || {};
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [form, setForm] = useState(DEFAULT_PROFILE);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiFetch("/profile", { method: "GET", token })
      .then((res) => {
        toast.success("Profile Updated")
        const data = res.profile || res;
        setProfile(data);
        setForm(data);
      })
      .catch((err) => {
        setError(err.message || "Failed to load profile");
        toast.error(err.message || "Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [token]);

  function handleEdit() {
    setEditMode(true);
    setError("");
  }
  function handleCancel() {
    setEditMode(false);
    setForm(profile);
    setError("");
  }
  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }
  function handleSave() {
    setLoading(true);
    setError("");
    apiFetch("/profile", {
      method: "PATCH",
      token,
      body: form,
    })
      .then((res) => {
        toast.success("Profile updated successfully");
        setProfile(res.profile || res);
        setForm(res.profile || res);
        setEditMode(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to update profile");
        toast.error(err.message || "Failed to update profile");
      })
      .finally(() => setLoading(false));
  }

  if (loading) return <div style={{ textAlign: "center", marginTop: 60 }}>Loading profile...</div>;

  return (
    <div style={{ padding: 40, maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 30 }}>My Profile</h2>
      {error && <div style={{ color: "#c00", marginBottom: 20 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <div>
          <label style={{ fontWeight: 600 }}>Full Name</label>
          <input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            disabled={!editMode}
            style={{ width: "100%", padding: 10, marginTop: 5 }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Role</label>
          <input
            value={form.role || ""}
            disabled
            style={{ width: "100%", padding: 10, marginTop: 5 }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Company</label>
          <input
            name="company"
            value={form.company || ""}
            onChange={handleChange}
            disabled={!editMode}
            style={{ width: "100%", padding: 10, marginTop: 5 }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Email</label>
          <input
            value={form.email || ""}
            disabled
            style={{ width: "100%", padding: 10, marginTop: 5 }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Phone</label>
          <input
            name="phone"
            value={form.phone || ""}
            onChange={handleChange}
            disabled={!editMode}
            style={{ width: "100%", padding: 10, marginTop: 5 }}
          />
        </div>
      </div>

      <div style={{ marginTop: 30, display: "flex", gap: 15 }}>
        {!editMode ? (
          <button onClick={handleEdit} style={{ padding: "10px 20px" }}>
            <FaEdit /> Edit Profile
          </button>
        ) : (
          <>
            <button onClick={handleSave} style={{ padding: "10px 20px", background: "#16a085", color: "#fff" }}>
              <FaSave /> Save
            </button>
            <button onClick={handleCancel} style={{ padding: "10px 20px" }}>
              <FaTimes /> Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}