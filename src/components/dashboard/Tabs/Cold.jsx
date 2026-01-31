import React from "react";
import CaseCard from "../../common/CaseCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../../../context/AuthContext";
import apiFetch from "./../../../utils/api";
import { exportLeadsToExcel } from "../../../services/leadExportService";
import { FaRedo } from "react-icons/fa";
import ServerSearchBar from "../../common/ServerSearchBar";
import { useColdCaseThreshold } from "../../../hooks/useSettings";

function Cold({ cases, handleRefresh, searchTerm = "", onSearchChange }) {
  const navigate = useNavigate();
  const { token } = useAuth() || {};
  const { coldCaseThresholdHours } = useColdCaseThreshold();

  // Export to Excel
  const handleExport = () => {
    exportLeadsToExcel(cases, "cold_leads.xlsx");
  };

  // Reopen case action
  const handleReopen = async (caseData) => {
    try {
      await apiFetch(`/cases/${caseData.caseid}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "Open" })
      });
      handleRefresh?.();
    } catch (err) {
      console.error("Failed to reopen case:", err);
    }
  };

  // Define actions for CaseCard
  const getActions = (caseData) => [
    'view',
    {
      icon: FaRedo,
      tooltip: 'Reopen Case',
      color: '#10b981',
      onClick: handleReopen
    }
  ];

  return (
    <>
      <div className="search-export-bar">
        <ServerSearchBar 
          searchTerm={searchTerm} 
          onSearchChange={onSearchChange} 
          placeholder="Search cases..."
        />
        <div className="case-count">
          Showing {cases?.length || 0} cases
        </div>
        <button onClick={handleExport} className="export-btn">
          Export to Excel
        </button>
      </div>
      <div className="case-cards-grid">
        {cases.length === 0 ?
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
          : cases.map((lead, index) => (
            <CaseCard
              key={lead.caseid || lead.id}
              caseData={lead}
              actions={getActions(lead)}
              showKam={true}
              colorIndex={index}
              showStaleIndicator={true}
              coldCaseThresholdHours={coldCaseThresholdHours}
            />
          ))}
      </div>
    </>
  );
}

export default Cold;