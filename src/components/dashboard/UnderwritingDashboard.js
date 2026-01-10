import React, { useEffect, useState } from "react";
import { FaDownload, FaTrash, FaUpload, FaPlus, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import apiFetch from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatIndianCurrency } from "../../utils/formatters";
import { FaSearch } from "react-icons/fa";
import { showSpinner, hideSpinner } from "../../utils/spinner";
import dayjs from "dayjs";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const PART_A_DOCS = [
  "Last 3 years financials Along with ITR's",
  "Latest year provisionals",
  "Debt sheet",
  "Work order - if applicable",
  "Company profile",
  "Sanction Letters"
];
const PART_B_DOCS = [
  "Company and promoters KYC",
  "Collateral full set",
  "Bank statements",
  "GSTR3B",
  "Individual itrs",
  "Projections",
  "Cma data"
];

export default function UnderwritingDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [uploads, setUploads] = useState({});
  const [newProvisionalName, setNewProvisionalName] = useState("");
  const [showAddProvisional, setShowAddProvisional] = useState(false);
  const [originalCases, setOriginalCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCases, setFilteredCases] = useState([]);
  
  // ✅ Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'assigneddate',
    direction: 'desc' // Default: newest first
  });

  useEffect(() => {
    fetchCases();
  }, []);

  // ✅ Apply sorting whenever cases or sort config changes
  useEffect(() => {
    if (cases.length > 0) {
      applySorting();
    }
  }, [sortConfig]);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (!searchValue.trim()) {
      setCases(originalCases);
      return;
    }

    const filtered = originalCases.filter((c) => {
      const searchLower = searchValue.toLowerCase();
      const bankNames = c?.bank_assignments?.map(ba => ba.bank_name).join(" ").toLowerCase() || "";

      return (
        (c.companyname || "").toLowerCase().includes(searchLower) ||
        (c.clientname || "").toLowerCase().includes(searchLower) ||
        (c.productname || "").toLowerCase().includes(searchLower) ||
        (c.assigned_to_name || c.assignee || "").toLowerCase().includes(searchLower) ||
        (c.status || "").toLowerCase().includes(searchLower) ||
        bankNames.includes(searchLower)
      );
    });

    setCases(filtered);
  };

  const filterCases = (criteria, value) => {
    // Reset search when applying other filters
    setSearchTerm("");

    if (value === "") {
      setCases(originalCases);
      return;
    }
    // if criteria is status
    if (criteria === "status") {
      setCases(originalCases.filter((c) => (c.status || "--").toLowerCase() === value.toLowerCase()));
    } else if (criteria === "time") {
      // Implement time-based filtering logic here
      const now = new Date();
      let filtered = [];
      switch (value) {
        case "Today":
          filtered = originalCases.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            return updatedAt.toDateString() === now.toDateString();
          });
          break;
        case "Yesterday":
          filtered = originalCases.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            return updatedAt.toDateString() === yesterday.toDateString();
          });
          break;
        case "Last 7 Days":
          filtered = originalCases.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 7);
            return updatedAt >= sevenDaysAgo;
          });
          break;
        case "Last 30 Days":
          filtered = originalCases.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return updatedAt >= thirtyDaysAgo;
          });
          break;
        case "This Week":
          const firstDayOfWeek = new Date(now);
          firstDayOfWeek.setDate(now.getDate() - now.getDay());
          filtered = originalCases.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            return updatedAt >= firstDayOfWeek;
          });
          break;
        case "This Month":
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = originalCases.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            return updatedAt >= firstDayOfMonth;
          });
          break;
        case "This Year":
          const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
          filtered = originalCases.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            return updatedAt >= firstDayOfYear;
          });
          break;
        default:
          filtered = originalCases;
      }
      setCases(filtered);
    } else if (criteria === "assignee") {
      setCases(originalCases.filter((c) => (c.assigned_to_name || c.assignee || "").toLowerCase() === value.toLowerCase()));
    }
  };

  // ✅ Sorting function
  const applySorting = () => {
    const sorted = [...cases].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (!aValue && !bValue) return 0;
      if (!aValue) return sortConfig.direction === 'asc' ? 1 : -1;
      if (!bValue) return sortConfig.direction === 'asc' ? -1 : 1;

      // Date comparison
      if (sortConfig.key === 'assigneddate') {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        
        if (sortConfig.direction === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      }

      // Default string comparison
      if (sortConfig.direction === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });

    setCases(sorted);
  };

  // ✅ Handle sort column click
  const handleSort = (key) => {
    let direction = 'asc';
    
    // Toggle direction if same column clicked
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  // ✅ Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort style={{ opacity: 0.3, marginLeft: 6 }} />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <FaSortUp style={{ color: '#2563eb', marginLeft: 6 }} />
      : <FaSortDown style={{ color: '#2563eb', marginLeft: 6 }} />;
  };

  // ✅ Format date display
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return dayjs(dateString).format('DD MMM YYYY');
  };

  const fetchCases = async () => {
    try {
      const res = await apiFetch("/cases?role=uw", { credentials: "include" });
      const casesArray = Array.isArray(res?.cases) ? res.cases : res;
      let updated = casesArray.map(c => {
        const docs = Array.isArray(c.documents) ? c.documents : [];
        const onePagers = docs.filter(d => d.doctype === "onePager");
        const latestOnePager = onePagers.sort((a, b) => new Date(b.uploadedat) - new Date(a.uploadedat))[0] || null;
        const provisionalDocs = docs.filter(d => d.doctype === "provisional");
        return { ...c, documents: docs, onePagerDoc: latestOnePager, provisionalDocs };
      });
      updated.forEach(c => {
        c.onePagerUploaded = c.documents.some(doc => doc.doctype === "onePager");
      });
      setFilteredCases(updated || []);
      setOriginalCases(updated || []);
      setCases(updated);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch cases");
    }
  };

  const handleFileChange = (e, caseId, docType, docName = null) => {
    const file = e.target.files[0];
    const key = docName ? `${caseId}_${docType}_${docName}` : `${caseId}_${docType}`;
    setUploads(prev => ({ ...prev, [key]: file }));
  };

  const updateWorkFlow = async (leadId, status) => {
    await apiFetch("/workflow/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        caseid: leadId,
        stage: status
      }),
    });
  };

  const handleDocumentUpload = async (caseId, docType, docName, uploadKey) => {
    const file = uploads[uploadKey];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caseid", caseId);
    formData.append("doctype", docType);
    formData.append("docname", docName);

    try {
      showSpinner();
      const res = await fetch(`${baseUrl}/documents/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      hideSpinner();

      if (!res.ok) throw new Error("Upload failed");

      toast.success(`✅ ${docName} uploaded successfully`);

      if (docType === "onePager") {
        updateWorkFlow(caseId, "One Pager");
      }

      // Refresh selected case
      const updated = await apiFetch(`/cases/${caseId}`, {
        credentials: "include"
      });
      setSelectedCase(updated);
      setUploads((prev) => ({ ...prev, [uploadKey]: null }));

      // Reset provisional form if it was a provisional upload
      if (docType === "provisional") {
        setNewProvisionalName("");
        setShowAddProvisional(false);
      }

    } catch (err) {
      toast.error("Upload error");
    }
  };

  const handleOnePagerUpload = async (caseId) => {
    await handleDocumentUpload(caseId, "onePager", "OnePager", `${caseId}_onePager`);
  };

  const handleProvisionalUpload = async (caseId, docName) => {
    if (!docName.trim()) {
      toast.error("Please enter document name");
      return;
    }
    await handleDocumentUpload(caseId, "provisional", docName, `${caseId}_provisional_${docName}`);
  };

  const handleDelete = async (docId, caseId, docType) => {
    try {
      await apiFetch(`/documents/${docId}`, {
        method: "DELETE",
        credentials: "include"
      });
      toast.success("Document deleted successfully");

      if (docType === "onePager") {
        updateWorkFlow(caseId, "Underwriting");
      }

      // Refresh current case
      const updated = await apiFetch(`/cases/${caseId}`, { credentials: "include" });
      setSelectedCase(updated);
    } catch {
      toast.error("Error deleting document");
    }
  };

  const getDownloadUrl = (filename) => baseUrl + `/documents/downloadNew/${filename}`;

  return (
    <div style={{ padding: 32, background: "#f8fafd", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, marginBottom: 24 }}>
        Underwriting Dashboard
      </h2>

      <div className="dashboard-filters" style={{ display: "flex", gap: "10px", marginBottom: 20 }}>
        {/* Search Input */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              paddingRight: "35px",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              minWidth: "200px"
            }}
          />
          <FaSearch style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#666"
          }} />
        </div>
        <label>
          Stage:
          <select className="filter-select" onChange={(e) => filterCases("status", e.target.value)}>
            <option value="">All</option>
            <option value="Open">Open</option>
            <option value="Meeting Done">Meeting Done</option>
            <option value="Documentation Initiated">Documentation Initiated</option>
            <option value="Documentation In Progress">Documentation In Progress</option>
            <option value="Underwriting">Underwriting</option>
            <option value="One Pager">One Pager</option>
            <option value="Banker Review">Banker Review</option>
            <option value="Completed">Completed</option>
          </select>
        </label>

        {/* Time filter like Today, Yesterday, Last 7 Days, Last 30 Days, This Week, This Month, This Year */}
        <label>
          Time:
          <select className="filter-select" onChange={(e) => filterCases("time", e.target.value)}>
            <option value="">All</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>
        </label>
      </div>

      {/* ✅ Results Count with Sort Info */}
      <div style={{ 
        marginBottom: '15px', 
        fontSize: '14px', 
        color: '#666',
        fontWeight: '500',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>
          Showing {cases.length} cases
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </span>
        <span style={{ fontSize: '12px', color: '#999' }}>
          Sorted by: {sortConfig.key === 'assigneddate' ? 'Assigned Date' : sortConfig.key} 
          ({sortConfig.direction === 'asc' ? 'Oldest First' : 'Newest First'})
        </span>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 6px 18px #3657db0c", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f1f4f9", textAlign: "left", fontWeight: "600" }}>
            <tr>
              <th style={{ padding: 14, textAlign: "center", width: '60px' }}>Status</th>
              <th style={{ padding: 14, textAlign: "left" }}>Company</th>
              <th style={{ padding: 14, textAlign: "left" }}>Client</th>
              <th style={{ padding: 14, textAlign: "left" }}>Product</th>
              <th style={{ padding: 14, textAlign: "left" }}>Requirement Amount</th>
              {/* ✅ Sortable Assigned Date Column */}
              <th 
                style={{ 
                  padding: 14, 
                  textAlign: "left",
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'background 0.2s'
                }}
                onClick={() => handleSort('assigneddate')}
                onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                title="Click to sort"
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Assigned Date
                  {getSortIcon('assigneddate')}
                </div>
              </th>
              <th style={{ padding: 14, textAlign: "center" }}>Documents</th>
            </tr>
          </thead>
          <tbody>
            {cases?.map((c, idx) => (
              <tr key={c.caseid} style={{ 
                borderBottom: "1px solid #eaeaea",
                transition: 'background 0.2s'
              }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                <td style={{ padding: 12, textAlign: "center" }}>
                  {c.onePagerUploaded && (
                    <span style={{
                      color: '#fff',
                      fontSize: 18,
                      fontWeight: 'bold',
                      border: '2px solid #4ade80',
                      borderRadius: '50%',
                      padding: '4px 8px',
                      backgroundColor: '#22c55e',
                      display: 'inline-block',
                      lineHeight: 1
                    }}>
                      ✓
                    </span>
                  )}
                </td>
                <td style={{ padding: 12, textAlign: "left", fontWeight: '500' }}>{c.companyname}</td>
                <td style={{ padding: 12, textAlign: "left" }}>{c.clientname}</td>
                <td style={{ padding: 12, textAlign: "left" }}>{c.productname || "--"}</td>
                <td style={{ padding: 12, textAlign: "left", fontWeight: '500' }}>
                  {c.requirement_amount && !isNaN(c.requirement_amount)
                    ? formatIndianCurrency(c.requirement_amount)
                    : (c.requirement_amount ? c.requirement_amount : "--")}
                </td>
                {/* ✅ Assigned Date Display */}
                <td style={{ 
                  padding: 12, 
                  textAlign: "left",
                  color: c.assigneddate ? '#374151' : '#9ca3af',
                  fontWeight: c.assigneddate ? '500' : 'normal'
                }}>
                  {formatDate(c.assigneddate)}
                </td>
                <td style={{ padding: 12, textAlign: "center" }}>
                  <button
                    onClick={() => setSelectedCase(c)}
                    style={{ 
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: 'white',
                      padding: "8px 12px", 
                      borderRadius: 6, 
                      border: "none",
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                    title="Upload / View Documents"
                  >
                    <FaDownload size={14} />
                    View Docs
                  </button>
                </td>
              </tr>
            ))}
            {cases.length === 0 && (
              <tr>
                <td colSpan="7" style={{ 
                  padding: 40, 
                  textAlign: 'center', 
                  color: '#999',
                  fontSize: 16
                }}>
                  {searchTerm ? 'No cases found matching your search' : 'No cases available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {selectedCase && (
        <div style={modalOverlay}>
          <div style={modalStyle}>
            <h3 style={{ marginBottom: 20 }}>Documents - {selectedCase.companyname}</h3>

            {/* Part A and Part B Documents */}
            {[{ part: "partA", title: "Part A", docs: PART_A_DOCS, color: "#3b82f6" },
            { part: "partB", title: "Part B", docs: PART_B_DOCS, color: "#6366f1" }]
              .map(({ part, title, docs, color }) => (
                <div key={part} style={{ borderTop: `2px solid ${color}`, marginTop: 20, paddingTop: 16 }}>
                  <h4 style={{ color }}>{title}</h4>
                  {docs.map(doc => {
                    const uploaded = selectedCase.documents?.find(
                      d => d.docname?.trim() === doc.trim() && d.doctype === part
                    );
                    return (
                      <div key={doc} style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 8 }}>
                        <div style={{ width: 250, fontSize: 14 }}>{doc}</div>
                        {uploaded ? (
                          <>
                            <span>{uploaded.filename}</span>
                            <a href={getDownloadUrl(uploaded.filename)} download target="_blank" title="Download">
                              <FaDownload style={{ color: "#2563eb" }} />
                            </a>
                          </>
                        ) : (
                          <span style={{ fontStyle: "italic", color: "#999" }}>Not uploaded</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

            {/* One Pager Upload Section */}
            <div style={{ borderTop: `2px solid #2563eb`, marginTop: 20, paddingTop: 16 }}>
              <h4 style={{ color: "#2563eb" }}>One Pager</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 250, fontSize: 14 }}>One Pager</div>

                {selectedCase.documents?.some(d => d.doctype === "onePager") ? (
                  <>
                    <span>
                      {selectedCase.documents.find(d => d.doctype === "onePager")?.filename}
                    </span>
                    <a
                      href={getDownloadUrl(selectedCase.documents.find(d => d.doctype === "onePager")?.filename)}
                      download target="_blank"
                    >
                      <FaDownload style={{ marginLeft: 6, color: "#2563eb" }} />
                    </a>
                    <FaTrash
                      onClick={() =>
                        handleDelete(
                          selectedCase.documents.find(d => d.doctype === "onePager")?.id,
                          selectedCase.caseid,
                          "onePager"
                        )
                      }
                      style={{ color: "#ef4444", cursor: "pointer" }}
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, selectedCase.caseid, "onePager")}
                    />
                    {uploads[`${selectedCase.caseid}_onePager`] && (
                      <button
                        onClick={() => handleOnePagerUpload(selectedCase.caseid)}
                        style={{
                          background: "#4e8df6",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "4px 10px"
                        }}
                      >
                        Upload
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Provisional Documents Section */}
            <div style={{ borderTop: `2px solid #22c55e`, marginTop: 20, paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ color: "#22c55e", margin: 0 }}>Other Documents</h4>
              </div>

              {/* Existing Provisional Documents */}
              {selectedCase.documents?.filter(d => d.doctype === "provisional").map(doc => (
                <div key={doc.id} style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 8 }}>
                  <div style={{ width: 250, fontSize: 14 }}>{doc.docname}</div>
                  <span>{doc.filename}</span>
                  <a href={getDownloadUrl(doc.filename)} download target="_blank" title="Download">
                    <FaDownload style={{ color: "#22c55e" }} />
                  </a>
                </div>
              ))}

              {/* Add New Provisional Document Form */}
              {showAddProvisional && (
                <div style={{
                  background: "#f8fffe",
                  border: "1px solid #22c55e",
                  borderRadius: 8,
                  padding: 16,
                  marginTop: 12
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Document Name:
                    </label>
                    <input
                      type="text"
                      value={newProvisionalName}
                      onChange={(e) => setNewProvisionalName(e.target.value)}
                      placeholder="Enter document name"
                      style={{
                        width: "100%",
                        padding: 8,
                        border: "1px solid #d1d5db",
                        borderRadius: 4,
                        fontSize: 14
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Select File:
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, selectedCase.caseid, "provisional", newProvisionalName)}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleProvisionalUpload(selectedCase.caseid, newProvisionalName)}
                      disabled={!newProvisionalName.trim() || !uploads[`${selectedCase.caseid}_provisional_${newProvisionalName}`]}
                      style={{
                        background: newProvisionalName.trim() && uploads[`${selectedCase.caseid}_provisional_${newProvisionalName}`] ? "#22c55e" : "#9ca3af",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "6px 12px",
                        cursor: newProvisionalName.trim() && uploads[`${selectedCase.caseid}_provisional_${newProvisionalName}`] ? "pointer" : "not-allowed"
                      }}
                    >
                      Upload
                    </button>
                    <button
                      onClick={() => {
                        setShowAddProvisional(false);
                        setNewProvisionalName("");
                      }}
                      style={{
                        background: "#6b7280",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "6px 12px",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {selectedCase.documents?.filter(d => d.doctype === "provisional").length === 0 && !showAddProvisional && (
                <div style={{ fontStyle: "italic", color: "#999", textAlign: "center", padding: 20 }}>
                  No provisional documents uploaded
                </div>
              )}
            </div>

            <div style={{ textAlign: "right", marginTop: 30 }}>
              <button
                onClick={() => setSelectedCase(null)}
                style={{ background: "#4e8df6", color: "white", border: "none", borderRadius: 6, padding: "8px 14px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
    </div>
  );
}

const modalOverlay = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.3)", display: "flex",
  justifyContent: "center", alignItems: "center", zIndex: 1000
};

const modalStyle = {
  background: "#fff", borderRadius: 10, padding: 30, width: "auto",
  maxWidth: 960, minWidth: 700, boxShadow: "0 4px 18px rgba(0,0,0,0.1)",
  maxHeight: "90vh", overflowY: "auto"
};