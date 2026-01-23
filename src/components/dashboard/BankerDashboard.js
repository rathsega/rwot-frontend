import React, { useEffect, useState } from "react";
import { FaRegCommentDots } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import apiFetch from '../../utils/api';
import ProvisionalDocsModal from "./ProvisionalDocsModal";

// Only these statuses for banker
const STATUS_OPTIONS = ["OPEN", "ACCEPT", "REJECTED", "LOGIN", "PD", "SANCTIONED", "DISBURSEMENT", "DONE"];
const COLUMN_WIDTHS = [220, 180, 180, 220, 200, 180, 180, 140];

export default function BankerDashboard() {
  const { token, user } = useAuth() || {};
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentModal, setCommentModal] = useState({ open: false, caseid: null });
  const [docsModal, setDocsModal] = useState({ open: false, caseid: null });
  const [statusUpdate, setStatusUpdate] = useState({});
  const [statusLoading, setStatusLoading] = useState(null);
  // For chat-like banker comments
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState("");
  // Provisional Docs Modal
  const [provisionalDocsModal, setProvisionalDocsModal] = useState({ open: false, caseid: null });
  const handleProvisionalDocsOpen = (caseid) => setProvisionalDocsModal({ open: true, caseid });
  const handleProvisionalDocsClose = () => setProvisionalDocsModal({ open: false, caseid: null });

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const fetchCases = () => {
    apiFetch("/cases", { method: "GET", token })
      .then(res => {
        const list = Array.isArray(res.cases) ? res.cases : Array.isArray(res) ? res : [];
        setCases(list);
      })
      .catch(err => setError(err.message || "Failed to load cases."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCases();
  }, [token]);

  // Update status
  const handleStatusChange = (caseid, value) => {
    setStatusLoading(caseid);
    setError("");
    apiFetch(`/cases/${caseid}/bankstatus`, {
      method: "PATCH",
      token,
      body: { status: value }
    })
      .then(() => {
        setCases(prev =>
          prev.map(c => c.caseid === caseid ? { ...c, status: value } : c)
        );
        setToast(`Status updated to '${value}' for case ${caseid}`);
        fetchCases(); // Refresh to get latest data
        setTimeout(() => setToast(""), 3000);
      })
      .catch(err => setError(err.message || "Failed to update status"))
      .finally(() => setStatusLoading(null));
  };

  // Open/close modals
  const handleCommentOpen = (caseid) => setCommentModal({ open: true, caseid });
  const handleCommentClose = () => setCommentModal({ open: false, caseid: null });

  const handleDocsOpen = (caseid) => setDocsModal({ open: true, caseid });
  const handleDocsClose = () => setDocsModal({ open: false, caseid: null });

  const getDownloadUrl = (filename) => baseUrl + `/documents/downloadNew/${filename}`;


  return (
    <div style={{ padding: "32px 48px 24px 48px", background: "#f8fafd", minHeight: "100vh" }}>
      {/* Custom scrollbar styles for scrollable containers */}
      <style>{`
        /* Docs Modal content wrapper */
        .docsModalContent::-webkit-scrollbar,
        .commentModalContent::-webkit-scrollbar,
        .commentMessageList::-webkit-scrollbar,
        .dashboardTableWrapper::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .docsModalContent::-webkit-scrollbar-thumb,
        .commentModalContent::-webkit-scrollbar-thumb,
        .commentMessageList::-webkit-scrollbar-thumb,
        .dashboardTableWrapper::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }
        .docsModalContent::-webkit-scrollbar-track,
        .commentModalContent::-webkit-scrollbar-track,
        .commentMessageList::-webkit-scrollbar-track,
        .dashboardTableWrapper::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
      <h2 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: 24, textAlign: "center" }}>
        Banker Dashboard
      </h2>
      {loading && (
        <div style={{ color: "#2979ff", fontWeight: 700, padding: 32, fontSize: 18 }}>
          Loading cases…
        </div>
      )}
      {error && (
        <div style={{ color: "#d63031", fontWeight: 600, marginBottom: 18, padding: 8 }}>
          {error}
        </div>
      )}
      {toast && (
        <div style={{
          marginBottom: 16,
          padding: "10px 16px",
          background: "#e6ffed",
          color: "#1b5e20",
          fontWeight: 600,
          borderRadius: 8,
          fontSize: 15
        }}>
          {toast}
        </div>
      )}
      <div
        className="dashboardTableWrapper"
        style={{
          borderRadius: 18,
          background: "#fff",
          boxShadow: "0 6px 18px #3657db0c",
          overflow: "auto",
          minWidth: "1150px",
          border: "1px solid #e4eaf2"
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: COLUMN_WIDTHS.map(w => `${w}px`).join(" "),
            background: "#f1f4f9",
            color: "#181C32",
            fontWeight: 700,
            fontSize: 15,
            borderBottom: "1px solid #e6e6ef",
            textAlign: "left"
          }}
        >
          <div style={{ padding: "14px 10px" }}>Company / Client</div>
          <div style={{ padding: "14px 10px" }}>POC</div>
          <div style={{ padding: "14px 10px" }}>Change Status</div>
          <div style={{ padding: "14px 10px" }}>OnePager</div>
          <div style={{ padding: "14px 10px" }}>Documents</div>
          <div style={{ padding: "14px 0px 14px 32px" }}>Assigned At</div>
          <div style={{ padding: "14px 10px" }}>Actions</div>
        </div>
        {/* Table Body */}
        {!loading && cases.length === 0 && (
          <div style={{ color: "#aaa", padding: 40, fontSize: 17 }}>No cases assigned.</div>
        )}
        {!loading && cases.map((c) => (
          <div
            key={c.id}
            style={{
              display: "grid",
              gridTemplateColumns: COLUMN_WIDTHS.map(w => `${w}px`).join(" "),
              borderBottom: "1px solid #f1f1fa",
              background: "#fff",
              fontSize: 15,
              fontWeight: 500,
              alignItems: "center",
              textAlign: "left"
            }}
          >
            <div style={{ padding: "13px 10px" }}>
              <div style={{ fontWeight: 600 }}>{c.companyname || c.company || "-"}</div>
              <div style={{ fontSize: 13, color: "#888" }}>{c.clientname || c.clientName || "-"}</div>
            </div>
            <div style={{ padding: "13px 10px" }}>{c.spocname || c.poc || "-"}</div>
            <div style={{ padding: "13px 10px" }}>
              <select
                defaultValue={c.bank_assignment_status == 'pending' ? "OPEN" : c.bank_assignment_status || "OPEN"}
                onChange={e => handleStatusChange(c.caseid, e.target.value)}
                style={{
                  borderRadius: 7,
                  padding: "5px 10px",
                  fontWeight: 600,
                  fontSize: 15,
                  border: "1px solid #d6dde5",
                  background: "#fff",
                  minWidth: 90
                }}
                disabled={!!statusLoading}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {/* No save button */}
            </div>
            <div style={{ padding: "13px 10px" }}>
              {(() => {
                const onePagerDoc = c.documents?.find(doc => doc.doctype === "onePager");
                return onePagerDoc ? (
                  <a
                    href={getDownloadUrl(onePagerDoc.url || `${onePagerDoc.filename}`)}
                    download
                    style={{ color: "#3d5af1", fontWeight: 600, textDecoration: "underline" }}
                    title={onePagerDoc.filename}
                  >
                    View OnePager
                  </a>
                ) : (
                  <span style={{ color: "#bbb" }}>Not uploaded</span>
                );
              })()}
            </div>

            <div style={{ padding: "13px 10px" }}>
              {!["OPEN", "REJECTED"].includes(c.bank_assignment_status) ? (
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); handleDocsOpen(c.id); }}
                  style={{ color: "#2979ff", fontWeight: 600, textDecoration: "underline" }}
                >
                  View Documents
                </a>
              ) : (
                <span style={{ color: "#bbb" }}>Not available</span>
              )}
              &nbsp;&nbsp;&nbsp;
              {
                /* Add a plus symbol for requesting additional documents, upon clicking on it open ProvisionalDocsModal */
                !["OPEN", "REJECTED"].includes(c.bank_assignment_status) && (
                  <span
                    onClick={() => handleProvisionalDocsOpen(c.caseid)}
                    style={{
                      color: "#2979ff",
                      fontWeight: 600,
                      textDecoration: "underline",
                      cursor: "pointer"
                    }}
                    title="Request Other Documents"
                  >
                    +
                  </span>
                )
              }
            </div>
            <div style={{ padding: "13px 0px 13px 32px" }}>
              {new Date(c.updatedat).toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }).replace(/(\d+)/, (match) => {
                const day = parseInt(match);
                const suffix = day % 10 === 1 && day !== 11 ? 'st' :
                  day % 10 === 2 && day !== 12 ? 'nd' :
                    day % 10 === 3 && day !== 13 ? 'rd' : 'th';
                return day + suffix;
              })}
            </div>
            <div style={{ padding: "13px 10px" }}>
              <button
                style={{
                  border: "none",
                  background: "none",
                  color: "#2979ff",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
                title="View/Add Comments"
                onClick={() => handleCommentOpen(c.id)}
              >
                <FaRegCommentDots style={{ marginRight: 4 }} />
                <span style={{ fontWeight: 600, fontSize: 15 }}>
                  {Array.isArray(c.comments)
                    ? c.comments.filter(comm => comm.by === "Banker").length
                    : 0}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {
        /* ProvisionalDocsModal can be added here if needed in future */
        provisionalDocsModal.open && (
          <ProvisionalDocsModal
            show={provisionalDocsModal.open}
            caseid={provisionalDocsModal.caseid}
            onClose={handleProvisionalDocsClose}
          />
        )
      }

      {/* --- Documents Modal --- */}
      {docsModal.open && (
        <div style={{
          position: "fixed",
          zIndex: 1100,
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(38, 47, 73, 0.17)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div
            className="docsModalContent"
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "24px 22px 18px 22px",
              minWidth: 340,
              minHeight: 140,
              maxHeight: 400,
              maxWidth: 420,
              boxShadow: "0 8px 42px 0 rgba(18,38,63,0.17)",
              overflowY: "auto"
            }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>Uploaded Documents</div>
            {/* List all uploaded Part-A and Part-B documents */}
            {(() => {
              const thisCase = cases.find(c => c.id === docsModal.caseid);
              console.log(thisCase);
              const partADocs = thisCase?.documents?.filter(doc => doc.doctype === "partA") || [];
              const partBDocs = thisCase?.documents?.filter(doc => doc.doctype === "partB") || [];
              const provisionalDocs = thisCase?.documents?.filter(doc => doc.doctype === "provisional") || [];
              if ((!partADocs || !partADocs.length) && (!partBDocs || !partBDocs.length))
                return <div style={{ color: "#bbb" }}>No documents uploaded.</div>;
              return (
                <>
                  {partADocs && partADocs.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "#2979ff", marginBottom: 3 }}>Part A</div>
                      {partADocs.map((doc, idx) => (
                        <div key={idx} style={{ marginBottom: 3 }}>
                          <a
                            href={getDownloadUrl(doc.url || `${doc.filename}`)}
                            download
                            style={{ color: "#44a957", textDecoration: "underline", fontWeight: 500 }}
                          >
                            {doc.docname}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  {partBDocs && partBDocs.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "#2979ff", marginBottom: 3 }}>Part B</div>
                      {partBDocs.map((doc, idx) => (
                        <div key={idx} style={{ marginBottom: 3 }}>
                          <a
                            href={getDownloadUrl(doc.url || `${doc.filename}`)}
                            download
                            style={{ color: "#44a957", textDecoration: "underline", fontWeight: 500 }}
                          >
                            {doc.docname}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  {provisionalDocs && provisionalDocs.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "#2979ff", marginBottom: 3 }}>Other Documents</div>
                      {provisionalDocs.map((doc, idx) => (
                        <div key={idx} style={{ marginBottom: 3 }}>
                          <a
                            href={getDownloadUrl(doc.url || `${doc.filename}`)}
                            download
                            style={{ color: "#44a957", textDecoration: "underline", fontWeight: 500 }}
                          >
                            {doc.docname}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
            <button
              onClick={handleDocsClose}
              style={{
                background: "#2979ff",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                padding: "7px 28px",
                marginTop: 22,
                alignSelf: "center",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- Comments Modal --- */}
      {commentModal.open && (
        <div style={{
          position: "fixed",
          zIndex: 1000,
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(38, 47, 73, 0.17)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div
            className="commentModalContent"
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "28px 22px 14px 22px",
              minWidth: 400,
              minHeight: 280,
              maxHeight: 500,
              maxWidth: 460,
              boxShadow: "0 8px 42px 0 rgba(18,38,63,0.17)",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column"
            }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12
            }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Banker Comments</div>
              <button
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  color: "#333",
                  cursor: "pointer"
                }}
                onClick={handleCommentClose}
                title="Close"
              >×</button>
            </div>

            <div className="commentMessageList" style={{ flexGrow: 1, overflowY: "auto", marginBottom: 14 }}>
              {(() => {
                const thisCase = cases.find(c => c.id === commentModal.caseid);
                const bankerComments = thisCase?.comments?.filter(comm => comm.by === "Banker");
                if (!bankerComments || bankerComments.length === 0)
                  return <div style={{ color: "#bbb", marginBottom: 10 }}>No comments yet.</div>;
                return (
                  <div>
                    {bankerComments.map((comm, idx) => (
                      <div key={idx} style={{
                        background: "#f4f8ff",
                        borderRadius: 8,
                        padding: "8px 10px",
                        marginBottom: 8,
                        fontSize: 15
                      }}>
                        <div style={{ fontWeight: 600, color: "#2979ff" }}>{comm.by}</div>
                        <div>{comm.text}</div>
                        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{comm.date}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{
                  flexGrow: 1,
                  padding: "8px 12px",
                  fontSize: 15,
                  borderRadius: 8,
                  border: "1px solid #ccc"
                }}
              />
              <button
                onClick={async () => {
                  if (!commentText.trim()) return;
                  await apiFetch("/comments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                      caseid: commentModal.caseid,
                      text: commentText
                    })
                  });
                  setCommentText("");
                  const res = await apiFetch("/cases", { method: "GET", credentials: "include" });
                  setCases(Array.isArray(res.cases) ? res.cases : []);
                }}
                style={{
                  background: "#2979ff",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 8,
                  padding: "8px 20px",
                  border: "none"
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}