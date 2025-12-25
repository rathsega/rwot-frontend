import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiFetch from '../../utils/api';

const ROLES = [
  "Telecaller",
  "KAM", 
  "UW",
  "Operations",
  "Banker"
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/users', { credentials: 'include' });
      console.log(response);
      // Filter out admin users
      const filteredUsers = response?.users?.filter(user => user.rolename !== 'Admin');
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error('Please enter a valid email');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!editingUser && !formData.password) {
      toast.error('Password is required');
      return false;
    }
    if (!editingUser && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!editingUser && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.role) {
      toast.error('Role is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role
      };

      if (!editingUser) {
        submitData.password = formData.password;
      }

      if (editingUser) {
        await apiFetch(`/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(submitData)
        });
        toast.success('User updated successfully');
      } else {
        await apiFetch('/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(submitData)
        });
        toast.success('User created successfully');
      }

      resetForm();
      fetchUsers();
    } catch (error) {
      console.error(error.message);
      toast.error(editingUser ? (error?.message ? error.message : 'Failed to update user') : (error?.message ? error.message : 'Failed to create user'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      confirmPassword: '',
      role: user.rolename
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);
      await apiFetch(`/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: ''
    });
    setEditingUser(null);
    setShowForm(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div style={{ padding: 32, background: "#f8fafd", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
            User Management
          </h2>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "#4e8df6",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            <FaPlus size={14} />
            Add User
          </button>
        </div>

        {/* User Registration Form */}
        {showForm && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              width: "100%",
              maxWidth: 500,
              maxHeight: "90vh",
              overflowY: "auto"
            }}>
              <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                    placeholder="Enter full name"
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                    placeholder="Enter email address"
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                    placeholder="Enter phone number"
                  />
                </div>

                {!editingUser && (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                        Password *
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          style={{
                            width: "100%",
                            padding: "10px 40px 10px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            fontSize: 14
                          }}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#6b7280"
                          }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                        Confirm Password *
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          style={{
                            width: "100%",
                            padding: "10px 40px 10px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            fontSize: 14
                          }}
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#6b7280"
                          }}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Select Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: 14,
                      background: "#fff"
                    }}
                  >
                    <option value="">Select a role</option>
                    {ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      background: "#6b7280",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "10px 20px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: loading ? "#9ca3af" : "#4e8df6",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "10px 20px",
                      cursor: loading ? "not-allowed" : "pointer"
                    }}
                  >
                    {loading ? "Saving..." : (editingUser ? "Update User" : "Create User")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 6px 18px #3657db0c",
          overflow: "hidden"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f1f4f9" }}>
              <tr>
                <th style={{ padding: 16, textAlign: "center", fontWeight: 600 }}>Name</th>
                <th style={{ padding: 16, textAlign: "center", fontWeight: 600 }}>Email</th>
                <th style={{ padding: 16, textAlign: "center", fontWeight: 600 }}>Phone</th>
                <th style={{ padding: 16, textAlign: "center", fontWeight: 600 }}>Role</th>
                <th style={{ padding: 16, textAlign: "center", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #f1f1f1" }}>
                    <td style={{ padding: 16 }}>{user.name}</td>
                    <td style={{ padding: 16 }}>{user.email}</td>
                    <td style={{ padding: 16 }}>{user.phone}</td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        background: "#e0f2fe",
                        color: "#0891b2",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {user.rolename}
                      </span>
                    </td>
                    <td style={{ padding: 16, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{
                            background: "#22c55e",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "6px 8px",
                            cursor: "pointer"
                          }}
                          title="Edit User"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={{
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "6px 8px",
                            cursor: "pointer"
                          }}
                          title="Delete User"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
    </div>
  );
}