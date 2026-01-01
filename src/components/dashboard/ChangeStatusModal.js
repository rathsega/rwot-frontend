import React, { useState, useEffect } from "react";
import { FaTimes, FaBuilding } from "react-icons/fa";
import { toast } from "react-toastify";

function ChangeStatusModal({ show, onClose, lead, onSubmit }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && lead) {
      setSelectedStatus(lead.status || "");
    }
  }, [show, lead]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStatus || selectedStatus === lead.status) {
      toast.warning("Please select a different status");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(lead.caseid, selectedStatus);
      toast.success("Status updated successfully!");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const statusOptions = [
    { value: "Meeting Done", label: "Meeting Done" },
    { value: "Documentation In Progress", label: "Documentation In Progress" },
    { value: "Underwriting", label: "Underwriting" },
    { value: "One Pager", label: "One Pager" },
    { value: "No Requirement", label: "No Requirement" },
    { value: "Rejected", label: "Rejected" },
    { value: "Login", label: "Login" },
    { value: "PD", label: "PD" },
    { value: "Sanctioned", label: "Sanctioned" },
    { value: "Disbursed", label: "Disbursed" },
    { value: "Done", label: "Done" }
  ];

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "32px",
        minWidth: "450px",
        maxWidth: "90%",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        position: "relative",
        animation: "slideUp 0.3s ease-out"
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: loading ? "not-allowed" : "pointer",
            color: "#666",
            opacity: loading ? 0.5 : 1
          }}
        >
          <FaTimes />
        </button>

        {/* Modal Header */}
        <h2 style={{
          margin: "0 0 8px 0",
          fontSize: "24px",
          fontWeight: "700",
          color: "#333"
        }}>
          Change Status
        </h2>
        <p style={{
          margin: "0 0 24px 0",
          fontSize: "14px",
          color: "#666"
        }}>
          <FaBuilding style={{ marginRight: "6px", color: "#2979ff" }} />
          {lead?.companyname}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Current Status */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#555",
              marginBottom: "8px"
            }}>
              Current Status
            </label>
            <div style={{
              padding: "12px 16px",
              background: "#f8f9fa",
              borderRadius: "8px",
              fontSize: "15px",
              color: "#333",
              fontWeight: "500"
            }}>
              {lead?.status || "N/A"}
            </div>
          </div>

          {/* New Status */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#555",
              marginBottom: "8px"
            }}>
              New Status <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={loading}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "500",
                background: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                outline: "none",
                transition: "border-color 0.2s ease",
                opacity: loading ? 0.6 : 1
              }}
              onFocus={(e) => e.target.style.borderColor = "#2979ff"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            >
              <option value="">-- Select New Status --</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end"
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "12px 24px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                background: "#fff",
                color: "#666",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: loading ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.background = "#f8f9fa";
                  e.target.style.borderColor = "#cbd5e0";
                }
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = "#e2e8f0";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedStatus || selectedStatus === lead?.status}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                background: loading || !selectedStatus || selectedStatus === lead?.status 
                  ? "#cbd5e0" 
                  : "#2979ff",
                color: "#fff",
                cursor: loading || !selectedStatus || selectedStatus === lead?.status 
                  ? "not-allowed" 
                  : "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseOver={(e) => {
                if (!loading && selectedStatus && selectedStatus !== lead?.status) {
                  e.target.style.background = "#1e5bb8";
                }
              }}
              onMouseOut={(e) => {
                if (!loading && selectedStatus && selectedStatus !== lead?.status) {
                  e.target.style.background = "#2979ff";
                }
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #fff",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }}></span>
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ChangeStatusModal;