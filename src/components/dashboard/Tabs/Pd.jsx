import React from "react";
import CaseCard from "../../common/CaseCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../../../context/AuthContext";
import apiFetch from "./../../../utils/api";
import { exportLeadsToExcel } from "../../../services/leadExportService";
import { FaEdit, FaArrowRight, FaClipboardCheck } from "react-icons/fa";
import ServerSearchBar from "../../common/ServerSearchBar";

function Pd({ cases, handleRefresh, searchTerm = "", onSearchChange }) {
  const navigate = useNavigate();
  const { token } = useAuth() || {};

  // Export to Excel
  const handleExport = () => {
    exportLeadsToExcel(cases, "pd_leads.xlsx");
  };

  // Move to next stage action
  const handleMoveToNextStage = async (caseData) => {
    try {
      await apiFetch(`/cases/${caseData.caseid}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "Sanctioned" })
      });
      handleRefresh?.();
    } catch (err) {
      console.error("Failed to move case to next stage:", err);
    }
  };

  // Define actions for CaseCard
  const getActions = (caseData) => [
    'view',
    'edit',
    {
      icon: FaArrowRight,
      tooltip: 'Move to Sanctioned',
      color: '#10b981',
      onClick: handleMoveToNextStage
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
            No records found in PD.
          </div>
          : cases.map((lead, index) => (
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

export default Pd;