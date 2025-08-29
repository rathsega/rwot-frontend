// ✅ FINAL UPDATED USERDASHBOARD CODE WITH ALL PATCHES APPLIED

import React, { useState, useEffect } from "react";
import {
  FaDownload, FaTrashAlt, FaUpload, FaArrowLeft, FaArrowRight
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import apiFetch from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MissingInfoModal from "../MissingInfoModal";

const baseUrl = "http://51.21.130.83:5001/api"

// const baseUrl = "http://localhost:5001/api"

const PART_A_DOCS = [
  "Last 3 years financials Along with ITR’s",
  "Latest year provisionals",
  "Debt sheet",
  "Work order - if applicable",
  "Company profile",
  "Collateral details",
  "Projections(CMA data)"
];
const PART_B_DOCS = [
  "Sanction Letters",
  "Individual ITR’s",
  "Company and promoters KYC",
  "Last one year banking of all the current accounts.",
  "Last one year GSTR3B of all the GST’s.",
  "Creditors and Debtors ageing report - if applicable",
  "Loan SOA’s",
  "Collateral full set",
  "Directors profile",
  "Group company details if any."
];
const PROGRESS_STEPS = [
  "Requirement Raised", "Part A Docs", "Part B Docs", "Banker Assigned", "Sanctioned"
];
const OTHER_PRODUCTS = [
  { name: "Working Capital Loan", desc: "Get working capital for your business." },
  { name: "Business Overdraft", desc: "Flexible overdraft facility for cashflow." },
  { name: "Term Loan", desc: "Long-term funding for assets/growth." },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [fileInputs, setFileInputs] = useState({});
  const [showProducts, setShowProducts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [deleting, setDeleting] = useState({});
  const [creatingCase, setCreatingCase] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [missingCase, setMissingCase] = useState(null);

  const fetchCases = async () => {
    const res = await apiFetch(`/cases/by-role`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "Individual" })
    });
    if (!res) {
      toast.error("❌ Failed to fetch cases.");
      throw new Error("Failed to fetch cases");
    }
    const data = await res;

    const updatedCases = data.cases
      .filter(c => c.assignee === user.email)
      .map(c => {
        const partADocs = (c.documents || []).filter(d => d.doctype === "partA");
        const partBDocs = (c.documents || []).filter(d => d.doctype === "partB");
        return { ...c, partADocs, partBDocs };
      });

    setCases(updatedCases);
    const incomplete = updatedCases.find(c =>
      !c.phonenumber || !c.spocname || !c.spocphonenumber || !c.companyemail
    );
    if (incomplete) {
      setMissingCase(incomplete);
      setShowMissingModal(true);
    }
  };

  useEffect(() => {
    fetchCases().finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", marginTop: 90 }}>Loading cases...</div>;
  if (!cases.length) return <div style={{ textAlign: "center", marginTop: 90 }}>No cases found for your account.</div>;

  const safeIdx = Math.min(Math.max(currentIdx, 0), cases.length - 1);
  const currCase = cases[safeIdx];

  const partAUploads = {};
  (currCase.partADocs || []).forEach((d, i) => {
    const docKey = d.docname || PART_A_DOCS[i] || d.filename || `doc${i}`;
    partAUploads[docKey] = d;
  });
  const partBUploads = {};
  (currCase.partBDocs || []).forEach((d, i) => {
    const docKey = d.docname || PART_B_DOCS[i] || d.filename || `doc${i}`;
    partBUploads[docKey] = d;
  });

  const numUploaded =
    PART_A_DOCS.filter((doc, i) => partAUploads[doc] || partAUploads[PART_A_DOCS[i]]).length +
    PART_B_DOCS.filter((doc, i) => partBUploads[doc] || partBUploads[PART_B_DOCS[i]]).length;
  const totalDocs = PART_A_DOCS.length + PART_B_DOCS.length;

  let activeStep = 0;
  if (numUploaded === 0) activeStep = 1;
  else if (numUploaded < PART_A_DOCS.length) activeStep = 2;
  else if (numUploaded < totalDocs) activeStep = 3;
  else if (currCase.banker && currCase.banker.assigned) activeStep = 4;
  else activeStep = 5;

  const createCase = async (product) => {
  const now = new Date();
  const createddate = now.toISOString();
  const [date, time] = createddate.split("T");

  const payload = {
    caseid: `C${Date.now()}`,
    companyname: user.company || "NA",
    companyemail: user.email,
    phonenumber: user.phone || "NA",
    createddate,
    assigneddate: createddate,
    spocname: user.name || "NA",
    spocemail: user.email,
    spocphonenumber: user.phone || "NA",
    status: "Requirement Raised",
    stage: "Requirement Raised",
    assignee: user.email,
    role: "Individual",
    clientname: user.name || "NA",
    leadsource: "User Dashboard",
    location: user.location || "NA",
    turnover: "",
    productname: product.name,
    amount: "",
    date,
    time: time ? time.replace("Z", "") : ""
  };

  const res = await apiFetch(`/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!res || res.error) {
    throw new Error("Failed to create case");
  }

  toast.success("✅ Case created successfully.");
};

  const deleteDoc = async (docId) => {
    const res = await fetch(`${baseUrl}/documents/${docId}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) {
      toast.error("❌ Delete failed.");
      throw new Error("Delete failed");
    }
    toast.success("🗑️ Document deleted successfully.");
    return await res;
  };

  const handleApplyProduct = async (product) => {
  setCreatingCase(true);
  try {
    await createCase(product);
    setShowProducts(false);
    await fetchCases();  // Refresh the case list
    setCurrentIdx(0);    // Reset to first case
  } catch (err) {
    toast.error("Failed to create case. " + (err.message || ""));
  } finally {
    setCreatingCase(false);
  }
};

const handleDownload = async (filename) => {
  try {
    const res = await fetch(`${baseUrl}/documents/download/${filename}`, {
      method: "GET",
      credentials: "include",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Failed to download");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download error:", err);
    toast.error("Download failed. Try again.");
  }
};

const handleDelete = async (part, doc) => {
  const uploadObj = part === "partA"
    ? partAUploads[doc] || Object.values(partAUploads).find(x => x && x.filename === doc)
    : partBUploads[doc] || Object.values(partBUploads).find(x => x && x.filename === doc);

  if (!uploadObj) return;

  setDeleting(prev => ({ ...prev, [part + doc]: true }));
  try {
    await deleteDoc(uploadObj.id);
    await fetchCases();  // Refresh list after delete
  } catch (err) {
    toast.error("Delete failed. Please try again.");
  } finally {
    setDeleting(prev => ({ ...prev, [part + doc]: false }));
  }
};

const handleFileChange = (part, doc, file) => {
  setFileInputs(prev => ({ ...prev, [part + doc]: file }));
};

const handleUpload = async (part, doc) => {
  const file = fileInputs[part + doc];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("caseid", currCase.caseid);
  formData.append("doctype", part);
  formData.append("docname", doc);

  try {
    const res = await fetch(`${baseUrl}/documents/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.ok) {
      await fetchCases(); // Refresh
      setFileInputs(prev => ({ ...prev, [part + doc]: null }));
      toast.success("✅ Document uploaded successfully.");
    } else {
      toast.error("❌ Upload failed.");
    }
  } catch {
    toast.error("❌ Upload failed.");
  }
};

  const goToNext = () => setCurrentIdx((prev) => Math.min(prev + 1, cases.length - 1));
  const goToPrev = () => setCurrentIdx((prev) => Math.max(prev - 1, 0));

  return (
    <div style={{ padding: "32px 0", background: "#f8fafd", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", margin: "0 40px 16px" }}>
        <button onClick={goToPrev} disabled={currentIdx === 0} style={{ border: "none", background: "none", cursor: "pointer" }}>
          <FaArrowLeft size={20} color={currentIdx === 0 ? "#ccc" : "#007bff"} />
        </button>
        <div style={{ fontWeight: 600, fontSize: 18 }}>Case {safeIdx + 1} of {cases.length}</div>
        <button onClick={goToNext} disabled={currentIdx === cases.length - 1} style={{ border: "none", background: "none", cursor: "pointer" }}>
          <FaArrowRight size={20} color={currentIdx === cases.length - 1 ? "#ccc" : "#1d4ed8"} />
        </button>
      </div>

      {/* Update card color from black to blue */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32, margin: "0 40px" }}>
        <div style={{ minWidth: 440, maxWidth: 600, background: "#1d4ed8", color: "#fff", borderRadius: 20, padding: 36 }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{currCase.companyname || "--"}</div>
          <div style={{ fontSize: 16, marginBottom: 4 }}>{currCase.clientname || "--"} | {currCase.spocname || "--"}</div>
          <div style={{ fontSize: 14, marginBottom: 10 }}>{currCase.phonenumber || "--"} | {currCase.companyemail || "--"}</div>
          <div style={{ background: "#ffe98f", color: "#5a4d25", padding: "6px 12px", borderRadius: 8, fontWeight: 700, display: "inline-block" }}>{currCase.status || "Docs Pending"}</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>{currCase.stage || "--"}</div>
        </div>
          <div style={{ textAlign: "center", marginTop: 50 }}>
          <button
            onClick={() => setShowProducts(true)}
            style={{
              background: "#1d4ed8",
              color: "#fff",
              fontWeight: 700,
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            Explore More Products
          </button>
        </div>
      </div>

      {/* More Products Modal */}
      {showProducts && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 32, minWidth: 320, maxWidth: 480
          }}>
            <h4 style={{ fontWeight: 700, marginBottom: 20 }}>Apply for New Products</h4>
            {OTHER_PRODUCTS.map((p, idx) => (
              <div key={idx} style={{ marginTop: 18, paddingBottom: 12, borderBottom: "1px solid #eee" }}>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 14, marginBottom: 6 }}>{p.desc}</div>
                <button
                  onClick={() => handleApplyProduct(p)}
                  style={{ background: "#1d4ed8", color: "#fff", border: "none", padding: "6px 16px", borderRadius: 6 }}
                >
                  Apply Now
                </button>
              </div>
            ))}
            <button onClick={() => setShowProducts(false)} style={{ marginTop: 20, background: "#1d4ed8", color: "#fff", padding: "8px 20px", border: "none", borderRadius: 6 }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Upload Sections */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40, marginTop: 30 }}>
        {[{ title: "Part A Documents", docs: PART_A_DOCS, uploads: partAUploads, part: "partA" },
          { title: "Part B Documents", docs: PART_B_DOCS, uploads: partBUploads, part: "partB" }]
          .map(({ title, docs, uploads, part }) => (
            <div key={part} style={{ background: "#fff", borderRadius: 14, padding: 24, width: 580, boxShadow: "0 2px 10px #e6ecf8" }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 12, color: "#1d4ed8" }}>{title}</div>
              {docs.map((doc, i) => {
                const uploaded = uploads[doc];
                return (
                  <div key={doc} style={{ borderBottom: "1px solid #f0f0f4", paddingBottom: 10, marginBottom: 10 }}>
                    <div style={{ fontWeight: 500, fontSize: 15 }}>{doc} {uploaded && <span style={{ color: "#16a085", marginLeft: 8 }}>Uploaded</span>}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {uploaded ? (
                        <>
                          <button
                            onClick={() => handleDownload(uploaded.filename)}
                            title="Download"
                            style={{
                              background: "#fff",
                              border: "1px solid #ccc",
                              padding: "6px 10px",
                              borderRadius: 6,
                              color: "#2a3057",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            <FaDownload /> Download
                          </button>
                          <span>{uploaded.filename}</span>
                          <button onClick={() => handleDelete(part, doc)} style={{ border: "none", background: "none", color: "#d63031" }}>
                            <FaTrashAlt />
                          </button>
                        </>
                      ) : (
                        <>
                          <input type="file" onChange={e => handleFileChange(part, doc, e.target.files[0])} />
                          <button
                            onClick={() => handleUpload(part, doc)}
                            disabled={!fileInputs[part + doc]}
                            style={{
                              background: "#1d4ed8", color: "#fff", padding: "4px 30px",
                              borderRadius: 6, border: "none", fontSize: 14
                            }}
                          >
                            <FaUpload /> Upload
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </div>

    </div>
  );
}
