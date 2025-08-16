import React, { useState, useEffect } from "react";
import { FaRegCommentDots } from "react-icons/fa";
import apiFetch  from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const PART_A_DOCS = [
  "Last 3 years financials Along with ITR’s",
  "Latest year provisionals",
  "Debt sheet",
  "Work order - if applicable",
  "Company profile"
];
const PART_B_DOCS = [
  "Sanction Letters",
  "Company and promoters KYC",
  "Collateral full set"
];

const COLUMNS = [
  { key: "company", label: "Company / Client", width: 200 },
  { key: "poc", label: "POC", width: 200 },
  { key: "leadsource", label: "Lead Source", width: 200 },
  { key: "kam", label: "KAM", width: 200 },
  { key: "status", label: "Status", width: 200 },
  { key: "assignedDate", label: "Assigned Date", width: 200 },
  { key: "turnover", label: "Turnover", width: 200 },
  { key: "location", label: "Location", width: 200 },
  { key: "stage", label: "Stage", width: 200 },
  { key: "banker", label: "Banker (If Approved)", width: 200 },
  { key: "pendingDocs", label: "Pending Docs", width: 200 },
  // { key: "description", label: "Description", width: 200 },
  { key: "comments", label: "Comments", width: 200 },
];

export default function KAMDashboard() {
  const { token } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPendingDocs, setShowPendingDocs] = useState(null);
  const [showComments, setShowComments] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterStage, setFilterStage] = useState("All");
  const [showDocuments, setShowDocuments] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    apiFetch("/cases", {
      method: "GET",
      token
    })
      .then((res) => {
        const arr = Array.isArray(res) ? res : res.cases || [];
        setCases(arr);
      })
      .catch((err) => setError(err.message || "Failed to fetch cases"))
      .finally(() => setLoading(false));
  }, [token]);

  const getPendingDocs = (c) => {
    const missingA = PART_A_DOCS.filter(
      (doc) => !(c.partADocs || []).some((d) => d.docName === doc || d.name === doc)
    );
    const missingB = PART_B_DOCS.filter(
      (doc) => !(c.partBDocs || []).some((d) => d.docName === doc || d.name === doc)
    );
    const missingOnePager = c.onePagerDoc ? [] : ["One Pager"];
    return [...missingA, ...missingB, ...missingOnePager];
  };

  const getUploadedDocs = (c) => ({
    partA: c.partADocs || [],
    partB: c.partBDocs || [],
    onePager: c.onePagerDoc ? [c.onePagerDoc] : []
  });

  const filteredCases = cases.filter(c => {
    const statusMatch = filterStatus === "All" || (c.status || "NA") === filterStatus;
    const stageMatch = filterStage === "All" || (c.stage || "NA") === filterStage;
    return statusMatch && stageMatch;
  });

  const uniqueStatuses = [
    ...new Set(cases.map((c) => c.status || "NA"))
  ];

  const uniqueStages = [
    ...new Set(cases.map((c) => c.stage || "NA"))
  ];

  return (
    <>
      <style>
        {`
          ::-webkit-scrollbar {
            height: 6px;
          }
          ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f8fafd;
          }
        `}
      </style>
      <div style={{ padding: "36px", background: "#f8fafd", minHeight: "100vh", fontFamily: '"Inter", sans-serif' }}>
      <h2 style={{ fontWeight: "800", fontSize: "1.8rem", marginBottom: 18 }}>KAM Dashboard</h2>
      {loading && <div style={{ color: "#2979ff" }}>Loading cases...</div>}
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ fontWeight: 600, marginRight: 8 }}>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 15 }}
          >
            <option>All</option>
            {uniqueStatuses.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, marginRight: 8 }}>Stage:</label>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 15 }}
          >
            <option>All</option>
            {uniqueStages.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{
        borderRadius: 12,
        background: "#fff",
        border: "1px solid #e5e7eb",
        overflowX: "auto",
        maxWidth: "100%",
        scrollbarWidth: "thin", // Firefox
        msOverflowStyle: "none", // IE 10+
      }}>
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
          {COLUMNS.map(col => (
            <div key={col.key} style={{
              flex: `0 0 ${col.width}px`,
              minWidth: col.width,
              fontWeight: 700,
              fontSize: 15,
              color: "#111827",
              textAlign: "left",
              padding: "14px 12px",
              borderRight: "1px solid #e5e7eb",
              borderBottom: "1px solid #e5e7eb",
              boxSizing: "border-box"
            }}>{col.label}</div>
          ))}
        </div>

        {filteredCases.map((c, idx) => {
          const pendingDocs = getPendingDocs(c);
          return (
            <div key={c.id} style={{
              display: "flex",
              borderTop: "1px solid #e5e7eb",
              alignItems: "center",
              background: "#fff"
            }}>
              <div style={cellStyle(COLUMNS[0])}>
                <div style={{ fontWeight: 600 }}>{c.company || c.companyname}</div>
                <div style={{ color: "#818694", fontSize: 13 }}>{c.clientname}</div>
              </div>
              <div style={cellStyle(COLUMNS[1])}>{c.spocname || "-"}</div>
              <div style={cellStyle(COLUMNS[2])}>{c.leadsource || "-"}</div>
              <div style={cellStyle(COLUMNS[3])}>{c.assigned_to_name || "-"}</div>
              <div style={cellStyle(COLUMNS[4])}>
                <span style={{ fontWeight: 600, fontSize: 15, color: "#3a3e51" }}>
                  {c.status || "--"}
                </span>
              </div>
              <div style={cellStyle(COLUMNS[5])}>{c.updatedat}</div>
              <div style={cellStyle(COLUMNS[6])}>{c.turnover || "--"}</div>
              <div style={cellStyle(COLUMNS[7])}>{c.location || "--"}</div>
              <div style={cellStyle(COLUMNS[8])}>{c.stage || "--"}</div>
              <div style={cellStyle(COLUMNS[9])}>
                {c.banker?.name || <span style={{ color: "#888" }}>Pending for Assignment to Bank</span>}
              </div>
              <div style={cellStyle(COLUMNS[10])}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDocuments({ uploaded: getUploadedDocs(c), pending: pendingDocs });
                  }}
                  style={{ color: "#3d5af1", fontWeight: 600, textDecoration: "underline" }}
                  aria-label="View pending documents"
                >
                  View
                </a>
              </div>
              {/* <div style={cellStyle(COLUMNS[11])}>--</div> */}
              <div style={cellStyle(COLUMNS[11])}>
                <span
                  style={{
                    background: "#eaf2ff",
                    color: "#2979ff",
                    borderRadius: 8,
                    padding: "5px 9px",
                    fontWeight: 700,
                    fontSize: 15,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer"
                  }}
                  onClick={() => setShowComments(c.comments || [])}
                  aria-label="View comments"
                >
                  <FaRegCommentDots /> {c.comments?.length || 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {showPendingDocs && (
        <Modal onClose={() => setShowPendingDocs(null)} title="Pending Documents">
          <ul style={{ paddingLeft: 18 }}>
            {showPendingDocs.map((doc, i) => (
              <li key={i} style={{ textAlign: "left", fontSize: 15 }}>{doc}</li>
            ))}
          </ul>
        </Modal>
      )}

      {showDocuments && (
        <Modal onClose={() => setShowDocuments(null)} title={`Documents - ${showDocuments?.uploaded?.partA?.[0]?.companyname || ""}`}>
          <div>
            <h4 style={{ textAlign: "center", marginBottom: 12, color: "#1d4ed8" }}>Part A</h4>
            {PART_A_DOCS.map((doc, i) => {
              const file = (showDocuments.uploaded.partA || []).find(d => d.docName === doc || d.name === doc);
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                  <span>{doc}</span>
                  {file?.url ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: "#2979ff", color: "#fff", padding: "4px 10px", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}
                    >
                      Download
                    </a>
                  ) : (
                    <span style={{ color: "#aaa" }}>Not Uploaded</span>
                  )}
                </div>
              );
            })}
            <hr style={{ margin: "20px 0" }} />
            <h4 style={{ textAlign: "center", marginBottom: 12, color: "#1d4ed8" }}>Part B</h4>
            {PART_B_DOCS.map((doc, i) => {
              const file = (showDocuments.uploaded.partB || []).find(d => d.docName === doc || d.name === doc);
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                  <span>{doc}</span>
                  {file?.url ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: "#2979ff", color: "#fff", padding: "4px 10px", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}
                    >
                      Download
                    </a>
                  ) : (
                    <span style={{ color: "#aaa" }}>Not Uploaded</span>
                  )}
                </div>
              );
            })}
            <hr style={{ margin: "20px 0" }} />
            <h4 style={{ textAlign: "center", marginBottom: 12, color: "#1d4ed8" }}>One Pager</h4>
            {showDocuments.uploaded.onePager.length > 0 ? (
              <a
                href={showDocuments.uploaded.onePager[0].url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: "#2979ff", color: "#fff", padding: "4px 10px", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}
              >
                Download One Pager
              </a>
            ) : (
              <span style={{ color: "#aaa" }}>Not Uploaded</span>
            )}
          </div>
        </Modal>
      )}

      {showComments && (
        <Modal onClose={() => setShowComments(null)} title="Case Comments" height={360}>
          <div style={{ maxHeight: 230, overflowY: "auto", padding: "2px 0" }}>
            {showComments.length > 0
              ? showComments.map((comm, idx) => (
                <div key={idx} style={{
                  marginBottom: 12,
                  background: "#f8fafd",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 15,
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <span style={{ fontWeight: 700, color: "#2979ff", marginBottom: 2 }}>{comm.by}</span>
                  <span style={{ color: "#484f5b", marginBottom: 2 }}>{comm.text}</span>
                  <span style={{ color: "#999", fontSize: 12 }}>{new Date(comm.date).toLocaleString()}</span>
                </div>
              ))
              : <div style={{ color: "#bbb" }}>No comments yet.</div>}
          </div>
        </Modal>
      )}
      </div>
    </>
  );
}

function cellStyle(col) {
  return {
    flex: `0 0 ${col.width}px`,
    minWidth: col.width,
    padding: "14px 12px",
    fontWeight: 500,
    fontSize: 14,
    color: "#374151",
    textAlign: "left",
    // borderBottom removed to prevent over-stacking
    boxSizing: "border-box",
  };
}

function Modal({ onClose, title, children, height }) {
  return (
    <div style={{
      position: "fixed", zIndex: 2000, top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(38, 47, 73, 0.18)", display: "flex",
      alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 15,
        minWidth: 340,
        width: "100%",
        maxWidth: 640,
        minHeight: 180,
        boxShadow: "0 8px 38px 0 rgba(18,38,63,0.18)",
        fontFamily: '"Inter", "SF Pro Display", Arial, sans-serif',
        padding: "26px 36px 20px 36px",
        position: "relative",
        height: height || undefined
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{title}</div>
        <button
          style={{
            position: "absolute", top: 12, right: 18, background: "none",
            border: "none", fontSize: 21, color: "#aaa", cursor: "pointer"
          }}
          onClick={onClose}
        >×</button>
        {children}
      </div>
    </div>
  );
}