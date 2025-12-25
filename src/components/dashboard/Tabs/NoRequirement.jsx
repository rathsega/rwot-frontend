import React, { useState, useEffect } from "react";
import ProgressCard from "./../ProgressCard";
import LeadDetailsModal from "./../LeadDetailsModal";
import { useAuth } from "./../../../context/AuthContext";
import apiFetch from "./../../../utils/api";

// Simple Excel export using SheetJS (xlsx)
import * as XLSX from "xlsx";

function Cold({ cases, handleRefresh }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [search, setSearch] = useState("");
  const [kamUsers, setKamUsers] = useState([]);
  const { token, user } = useAuth() || {};
  const bgClasses = ['bg-blue', 'bg-green', 'bg-yellow', 'bg-pink', 'bg-purple', 'bg-gray'];

const [filteredLeads, setFilteredLeads] = useState(cases??[]);
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
    // Flatten comments and documents for export
    const data = cases?.map(lead => ({
      ...lead,
      comments: lead.comments?.map(c => `${c.commentby}: ${c.comment}`).join(" | "),
      documents: lead.documents?.map(d => `${d.docname} (${d.filename})`).join(" | ")
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "leads.xlsx");
  };


  // Fetch KAM users
    useEffect(() => {
      apiFetch("/users/getKamAndTelecallers", {
        method: "GET",
        token
      })
        .then((res) => {
          const users = res.users || res || [];
          const kams = users.filter(u => u.rolename === "KAM");
          setKamUsers(kams);
        })
        .catch((err) => console.error("Failed to fetch KAM users:", err));
    }, [token]);

  return (
    <>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 24,
        marginTop: 16,
        justifyContent: "space-between"
      }}>
        <input
          type="text"
          placeholder="Search cases..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: "10px 16px",
            border: "1.5px solid #d1d5db",
            borderRadius: 8,
            fontSize: 15,
            minWidth: 220,
            flex: 1,
            maxWidth: 340
          }}
        />
        <div>
          Showing {filteredLeads?.length} of {cases?.length} cases
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <button
            onClick={handleExport}
            style={{
              background: "#2979ff",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 2px 8px 0 rgba(38,47,73,0.06)"
            }}
          >
            Export to Excel
          </button>
        </div>
      </div>
      <div className="cards-container">
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
            No records found in Done.
          </div>
          : filteredLeads.map((lead, idx) => (
            <ProgressCard
              key={lead.id}
              lead={lead}
              bgClass={bgClasses[idx % bgClasses.length]}
              cardClick={() => setSelectedCard(lead)}
              handleRefresh={handleRefresh}
              kamUsers={kamUsers}
            />
          ))}
      </div>
      {selectedCard && (
        <LeadDetailsModal
          lead={selectedCard}
          onClose={() => setSelectedCard(null)}
          handleRefresh={handleRefresh}
        />
      )}
    </>
  );
}

export default Cold;