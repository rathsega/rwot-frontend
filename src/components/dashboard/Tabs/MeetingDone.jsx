import React, { useState, useEffect } from "react";
import CaseCard from "../../common/CaseCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../../../context/AuthContext";
import apiFetch from "./../../../utils/api";
import { exportLeadsToExcel } from "../../../services/leadExportService";
import { FaFileAlt, FaBan } from "react-icons/fa";
import ServerSearchBar from "../../common/ServerSearchBar";

function MeetingDone({ cases, handleRefresh, searchTerm = "", onSearchChange }) {
  const navigate = useNavigate();
  const { token } = useAuth() || {};

  // Export to Excel
  const handleExport = () => {
    exportLeadsToExcel(cases, "meeting_done_leads.xlsx");
  };

  // Initiate documentation action
  const handleInitiateDocumentation = async (caseData) => {
    try {
      await apiFetch(`/cases/${caseData.caseid}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "Documentation Initiated" })
      });
      handleRefresh?.();
    } catch (err) {
      console.error("Failed to initiate documentation:", err);
    }
  };

  // Reject action
  const handleReject = async (caseData) => {
    try {
      await apiFetch(`/cases/${caseData.caseid}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "Rejected" })
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
      icon: FaFileAlt,
      tooltip: 'Initiate Documentation',
      color: '#10b981',
      onClick: handleInitiateDocumentation
    },
    {
      icon: FaBan,
      tooltip: 'Reject',
      color: '#ef4444',
      onClick: handleReject
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
            />
          ))}
      </div>
    </>
  );
}

export default MeetingDone;