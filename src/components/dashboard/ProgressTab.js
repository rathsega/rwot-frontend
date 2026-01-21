import React, { useState } from "react";
import CaseCard from "../common/CaseCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { exportLeadsToExcel } from "../../services/leadExportService";

function ProgressTab({ progress, handleRefresh }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { token } = useAuth() || {};

  // Filter leads by search string (case-insensitive, match anywhere in any value)
  const filteredLeads = progress?.filter(lead =>
    search.trim() === "" ||
    Object.values(lead)
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  // Export to Excel
  const handleExport = () => {
    exportLeadsToExcel(progress, "progress_leads.xlsx");
  };

  // Define actions for CaseCard
  const getActions = (caseData) => [
    'view',
    'edit'
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
          Showing {filteredLeads?.length || 0} of {progress?.length || 0} cases
        </div>
        <button onClick={handleExport} className="export-btn">
          Export to Excel
        </button>
      </div>
      <div className="case-cards-grid">
        {filteredLeads.length === 0 ?
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
          : filteredLeads.map((lead, index) => (
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

export default ProgressTab;