import React, { useState, useEffect } from "react";
import CaseCard from "../../common/CaseCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../../../context/AuthContext";
import apiFetch from "./../../../utils/api";
import { exportLeadsToExcel } from "../../../services/leadExportService";
import { FaEdit, FaArrowRight, FaClipboardCheck } from "react-icons/fa";

function Pd({ cases, handleRefresh }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { token } = useAuth() || {};

const [filteredLeads, setFilteredLeads] = useState(cases);
  // ✅ Recursive function to flatten nested objects and arrays
  const flattenObject = (obj, prefix = '') => {
    let result = [];

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        // Skip null or undefined
        if (value === null || value === undefined) {
          continue;
        }

        // If it's an array, flatten each item
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              result = result.concat(flattenObject(item, `${prefix}${key}[${index}].`));
            } else {
              result.push(String(item));
            }
          });
        }
        // If it's an object, recurse
        else if (typeof value === 'object') {
          result = result.concat(flattenObject(value, `${prefix}${key}.`));
        }
        // Otherwise, add the value
        else {
          result.push(String(value));
        }
      }
    }

    return result;
  };

  useEffect(() => {
    // Filter leads by search string (case-insensitive, match anywhere in any value including nested objects)
    const fl = cases?.filter(lead => {
      if (search.trim() === "") return true;

      // ✅ Flatten the lead object to get all nested values
      const allValues = flattenObject(lead);

      // Log for debugging
      console.log("Flattened values:", allValues);

      // Join all values and search
      const searchableText = allValues.join(" ").toLowerCase();
      const searchTerm = search.trim().toLowerCase();

      return searchableText.includes(searchTerm);
    });

    console.log("Filtered leads:", fl);
    setFilteredLeads(fl);
  }, [search, cases]);

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
        body: JSON.stringify({ status: "Underwriting" })
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
      tooltip: 'Move to Underwriting',
      color: '#10b981',
      onClick: handleMoveToNextStage
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
          Showing {filteredLeads?.length || 0} of {cases?.length || 0} cases
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
            No records found in PD.
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

export default Pd;