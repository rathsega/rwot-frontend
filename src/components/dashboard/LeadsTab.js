import React, { useState } from "react";
import CaseCard from "../common/CaseCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiFetch from "../../utils/api";

// Simple Excel export using SheetJS (xlsx)
import { exportLeadsToExcel } from "../../services/leadExportService";
import { FaHandshake, FaBan } from "react-icons/fa";

function LeadsTab({ leads, handleRefresh }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { token } = useAuth() || {};

  // Filter leads by search string (case-insensitive, match anywhere in any value)
  const filteredLeads = leads.filter(lead =>
    search.trim() === "" ||
    Object.values(lead)
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  // Export to Excel (uses global service)
  const handleExport = () => {
    exportLeadsToExcel(leads, "leads.xlsx");
  };

  // Meeting Done action
  const handleMeetingDone = async (caseData) => {
    try {
      await apiFetch(`/cases/${caseData.caseid}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "Meeting Done" })
      });
      handleRefresh?.();
    } catch (err) {
      console.error("Failed to mark meeting done:", err);
    }
  };

  // Reject case action
  const handleReject = async (caseData) => {
    try {
      await apiFetch(`/cases/${caseData.caseid}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "No Requirement" })
      });
      handleRefresh?.();
    } catch (err) {
      console.error("Failed to reject case:", err);
    }
  };

  // Define actions for CaseCard
  const getActions = (caseData) => [
    'view',
    'edit',
    {
      icon: FaHandshake,
      tooltip: 'Meeting Done',
      color: '#10b981',
      onClick: handleMeetingDone
    },
    {
      icon: FaBan,
      tooltip: 'No Requirement',
      color: '#ef4444',
      onClick: handleReject
    }
  ];

  return (
    <>
      <div className="search-export-bar">
        <input
          type="text"
          placeholder="Search cases..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="case-count">
          Showing {filteredLeads?.length || 0} of {leads?.length || 0} cases
        </div>
        <button onClick={handleExport} className="export-btn">
          Export to Excel
        </button>
      </div>
      <div className="case-cards-grid">
        {filteredLeads?.length === 0 ?
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              color: "#888",
              background: "#f6f8fc",
              borderRadius: "16px",
              fontSize: "1.2rem",
              fontWeight: 500,
              margin: "32px auto",
              maxWidth: 400,
              boxShadow: "0 2px 12px 0 rgba(38,47,73,0.06)",
            }}
          >
            <span role="img" aria-label="no data" style={{ fontSize: 38, display: "block", marginBottom: 12 }}>📄</span>
            No records found.
          </div>
          : filteredLeads?.map((lead, index) => (
            <CaseCard
              key={lead.caseid || lead.id}
              caseData={lead}
              actions={getActions(lead)}
              showKam={true}
              colorIndex={index}
            />
          ))}
      </div>
    </>
  );
}

export default LeadsTab;