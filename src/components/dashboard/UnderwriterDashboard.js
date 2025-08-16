// Paste this code in your UnderwriterDashboard.js

import React, { useEffect, useState } from "react";
import { FaDownload, FaTrash, FaUpload } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import apiFetch from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const baseUrl = "http://localhost:5001/api";

const baseUrl = "http://www.rwot.in/api"

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

export default function UnderwriterDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [uploads, setUploads] = useState({});

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await apiFetch("/cases", { credentials: "include" });
      const casesArray = Array.isArray(res?.cases) ? res.cases : res;
      const updated = casesArray.map(c => {
        const docs = Array.isArray(c.documents) ? c.documents : [];
        const onePagers = docs.filter(d => d.doctype === "onePager");
        const latestOnePager = onePagers.sort((a, b) => new Date(b.uploadedat) - new Date(a.uploadedat))[0] || null;
        return { ...c, documents: docs, onePagerDoc: latestOnePager };
      });
      setCases(updated);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch cases");
    }
  };

  const handleOnePagerChange = (e, caseId) => {
    const file = e.target.files[0];
    setUploads(prev => ({ ...prev, [`${caseId}_onePager`]: file }));
  };

const handleOnePagerUpload = async (caseId) => {
  const file = uploads[`${caseId}_onePager`];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("caseid", caseId);
  formData.append("doctype", "onePager");
  formData.append("docname", "OnePager");

  try {
    const res = await fetch(`${baseUrl}/documents/upload`, {
      method: "POST",
      credentials: "include",
      body: formData
    });

    if (!res.ok) throw new Error("Upload failed");

    toast.success("✅ OnePager uploaded");

    // ✅ Refresh just selected case (not whole list)
    const updated = await apiFetch(`/cases/${caseId}`, {
      credentials: "include"
    });
    setSelectedCase(updated);
    setUploads((prev) => ({ ...prev, [`${caseId}_onePager`]: null }));

    // Optionally refresh all cases too if needed:
    // await fetchCases();
  } catch (err) {
    toast.error("Upload error");
  }
};

const handleDelete = async (docId, caseId) => {
  try {
    await apiFetch(`/documents/${docId}`, {
      method: "DELETE",
      credentials: "include"
    });
    toast.success("OnePager deleted.");

    // 🔁 Refresh current case
    const updated = await apiFetch(`/cases/${caseId}`, { credentials: "include" });
    setSelectedCase(updated);
  } catch {
    toast.error("Error deleting OnePager");
  }
};

  return (
    <div style={{ padding: 32, background: "#f8fafd", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, marginBottom: 24 }}>
        Underwriter Dashboard
      </h2>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 6px 18px #3657db0c", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f1f4f9", textAlign: "left", fontWeight: "600" }}>
            <tr>
              {/* <th style={{ padding: 14, textAlign: "left"   }}>#</th> */}
              <th style={{ padding: 14, textAlign: "left"   }}>Company</th>
              <th style={{ padding: 14, textAlign: "left"   }}>Client</th>
              <th style={{ padding: 14, textAlign: "left"   }}>Product</th>
              <th style={{ padding: 14, textAlign: "left"   }}>Documents</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c, idx) => (
              <tr key={c.caseid} style={{ borderBottom: "1px solid #eaeaea" }}>
                {/* <td style={{  padding: 12, textAlign: "left"  }}>{idx + 1}</td> */}
                <td style={{  padding: 12, textAlign: "left"  }}>{c.companyname}</td>
                <td style={{  padding: 12, textAlign: "left"  }}>{c.clientname}</td>
                <td style={{  padding: 12, textAlign: "left"  }}>{c.productname || "--"}</td>
                <td style={{  padding: 12, textAlign: "left"  }}>
                  <button
                    onClick={() => setSelectedCase(c)}
                    style={{ background: "#ffffff", padding: "6px 10px", borderRadius: 6, border: "none" }}
                  >
                    <FaUpload title="Upload / View Docs" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {selectedCase && (
        <div style={modalOverlay}>
          <div style={modalStyle}>
            <h3 style={{ marginBottom: 20 }}>Documents - {selectedCase.companyname}</h3>

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
                            <a href={`/uploads/${uploaded.filename}`} download title="Download">
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

                {/* ✅ If uploaded, show filename + download/delete */}
                {selectedCase.documents?.some(d => d.doctype === "onePager") ? (
                  <>
                    <span>
                      {
                        selectedCase.documents.find(d => d.doctype === "onePager")?.filename
                      }
                    </span>
                    <a
                      href={`/uploads/${selectedCase.documents.find(d => d.doctype === "onePager")?.filename}`}
                      download
                    >
                      <FaDownload style={{ marginLeft: 6, color: "#2563eb" }} />
                    </a>
                    <FaTrash
                      onClick={() =>
                        handleDelete(
                          selectedCase.documents.find(d => d.doctype === "onePager")?.id,
                          selectedCase.caseid
                        )
                      }
                      style={{ color: "#ef4444", cursor: "pointer" }}
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="file"
                      onChange={(e) =>
                        setUploads((prev) => ({
                          ...prev,
                          [`${selectedCase.caseid}_onePager`]: e.target.files[0]
                        }))
                      }
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
  maxWidth: 960, minWidth: 700, boxShadow: "0 4px 18px rgba(0,0,0,0.1)"
};