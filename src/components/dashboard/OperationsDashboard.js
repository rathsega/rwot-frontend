// OperationsDashboard.js
import React, { useEffect, useState } from "react";
import { FaDownload, FaUpload, FaUserPlus, FaTrash } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import apiFetch from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

export default function OperationsDashboard() {
  const { token } = useAuth();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [uploads, setUploads] = useState({});
  const [bankList, setBankList] = useState([]);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [currentCaseId, setCurrentCaseId] = useState(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const res = await apiFetch("/cases", { credentials: "include" });
      setCases(res?.cases || []);
    } catch {
      toast.error("Failed to load cases");
    }
  };

  const handleUpload = async (caseid, doc, part) => {
    const file = uploads[`${doc}_${part}`];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caseid", caseid);
    formData.append("doctype", part);
    formData.append("docname", doc);

    try {
      const res = await fetch(`${baseUrl}/documents/upload`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!res.ok) throw new Error("Upload failed");

      toast.success("Document uploaded successfully");

      // Refresh updated case only
      const updatedCase = await apiFetch(`/cases/${caseid}`, { credentials: "include" });

      // Replace that case inside global list
      setCases(prev =>
        prev.map(c => (c.caseid === caseid ? updatedCase : c))
      );

      // Update the currently open modal view
      setSelectedCase(updatedCase);

      // Reset file input
      setUploads(prev => ({ ...prev, [`${doc}_${part}`]: null }));
    } catch (err) {
      toast.error("Upload failed");
    }
  };

const handleDelete = async (caseid, doc, part) => {
  const match = selectedCase.documents?.find(
    d => d.docname?.trim() === doc.trim() && d.doctype === part
  );
  if (!match?.id) return toast.error("No matching document found");

  try {
    await fetch(`${baseUrl}/documents/${match.id}`, {
      method: "DELETE",
      credentials: "include"
    });

    toast.success("Document deleted");

    const updatedCase = await apiFetch(`/cases/${caseid}`, { credentials: "include" });

    setCases(prev =>
      prev.map(c => (c.caseid === caseid ? updatedCase : c))
    );

    setSelectedCase(updatedCase);
  } catch {
    toast.error("Delete failed");
  }
};

  const handleShare = async (caseid) => {
    setCurrentCaseId(caseid);
    setSelectedBanks([]);
    await fetchBanks();
    setShowBankModal(true);
  };

  const fetchBanks = async () => {
    try {
      const res = await apiFetch("/banks", { credentials: "include" });
      setBankList(res?.banks || []);
    } catch {
      toast.error("Failed to load banks");
    }
  };

  const handleSubmitBanks = async () => {
    try {
      await apiFetch("/workflow/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          caseid: currentCaseId,
          stage: "Banker Review",
          banks: selectedBanks
        }),
      });
      toast.success("Case shared with selected banks");
      await loadCases();
    } catch {
      toast.error("Failed to share case");
    } finally {
      setShowBankModal(false);
    }
  };

  return (
    <div style={{ padding: 32, background: "#f8fafd", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, marginBottom: 24 }}>
        Operations Dashboard
      </h2>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 6px 18px #3657db0c", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f1f4f9", textAlign: "left", fontWeight: "600" }}>
            <tr>
              {/* <th style={{ padding: 14 }}>#</th> */}
              <th style={{ padding: 14 }}>Company</th>
              <th style={{ padding: 14 }}>Client</th>
              <th style={{ padding: 14 }}>Product</th>
              <th style={{ padding: 14 }}>Status</th>
              <th style={{ padding: 14 }}>Stage</th>
              <th style={{ padding: 14 }}>Documents</th>
              <th style={{ padding: 14 }}>Share</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c, idx) => (
              <tr key={c.caseid} style={{ borderBottom: "1px solid #eaeaea", textAlign: "left" }}>
                {/* <td style={{ padding: 12 }}>{idx + 1}</td> */}
                <td style={{ padding: 12 }}>{c.companyname}</td>
                <td style={{ padding: 12 }}>{c.clientname}</td>
                <td style={{ padding: 12 }}>{c.productname || "--"}</td>
                <td style={{ padding: 12 }}>{c.status || "--"}</td>
                <td style={{ padding: 12 }}>{c.stage || "--"}</td>
                <td style={{ padding: 12 }}>
                  <button onClick={() => setSelectedCase(c)} style={{ background: "#ffffff", border: "none" }} title="Documents">
                    <FaUpload />
                  </button>
                </td>
                <td style={{ padding: 12 }}>
                  <button
                    onClick={() => handleShare(c.caseid)}
                    disabled={c.stage !== "One-pager Uploaded"}
                    style={{
                      background: "#ffffff",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "none",
                      cursor: c.stage === "One-pager Uploaded" ? "pointer" : "not-allowed"
                    }}
                  >
                    <FaUserPlus />
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
            <h3>Documents - {selectedCase.companyname}</h3>
            {[{ part: "partA", title: "Part A", docs: PART_A_DOCS, color: "#3b82f6" },
              { part: "partB", title: "Part B", docs: PART_B_DOCS, color: "#6366f1" }].map(({ part, title, docs, color }) => (
              <div key={part} style={{ borderTop: `2px solid ${color}`, marginTop: 20, paddingTop: 16 }}>
                <h4 style={{ color }}>{title}</h4>
                {docs.map(doc => {
                  const fileKey = `${doc}_${part}`;
                  const uploaded = selectedCase.documents?.find(d => d.docname?.trim() === doc.trim() && d.doctype === part);
                  const newFile = uploads[fileKey];

                  return (
                    <div key={doc} style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 8 }}>
                      <div style={{ width: 250 }}>{doc}</div>
                      {!uploaded && !newFile && (
                        <input type="file" onChange={e => setUploads(prev => ({ ...prev, [fileKey]: e.target.files[0] }))} />
                      )}
                      {newFile && (
                        <>
                          <div>{newFile.name}</div>
                          <button onClick={() => handleUpload(selectedCase.caseid, doc, part)}
                            style={{ background: "#4e8df6", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px" }}>
                            Upload
                          </button>
                        </>
                      )}
                      {uploaded && (
                        <>
                          <span>{uploaded.filename}</span>
                          <a href={`/uploads/${uploaded.filename}`} download>
                            <FaDownload style={{ color: "#2563eb" }} />
                          </a>
                          <FaTrash onClick={() => handleDelete(selectedCase.caseid, doc, part)}
                            style={{ color: "#ef4444", cursor: "pointer" }} />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div style={{ textAlign: "right", marginTop: 30 }}>
              <button onClick={() => { setSelectedCase(null); setUploads({}); }}
                style={{ background: "#4e8df6", color: "white", border: "none", borderRadius: 6, padding: "8px 14px" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Selection Modal */}
      {showBankModal && (
        <div style={modalOverlay}>
          <div style={modalStyle}>
            <h3>Select Banks to Share Case</h3>
            <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 20 }}>
              {bankList.map((bank) => (
                <div key={bank.id} style={{ marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    value={bank.id}
                    checked={selectedBanks.includes(bank.id)}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      setSelectedBanks(prev =>
                        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                      );
                    }}
                  />
                  <span style={{ marginLeft: 8 }}>{bank.name}</span>
                </div>
              ))}
            </div>
            <button onClick={handleSubmitBanks} style={{ background: "#2563eb", color: "white", padding: "6px 16px", borderRadius: 6, border: "none" }}>
              Submit
            </button>
            <button onClick={() => setShowBankModal(false)} style={{ marginLeft: 12, padding: "6px 16px", borderRadius: 6 }}>
              Cancel
            </button>
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