import React, { useState, useEffect } from "react";
import { FaTimes, FaBuilding, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaClock, FaFileAlt, FaSourcetree, FaComments, FaCloudDownloadAlt, FaCloudUploadAlt, FaTrashAlt, FaUpload } from "react-icons/fa";
import { MdAssignmentInd } from "react-icons/md";
import { GiProgression } from "react-icons/gi";
import { BsBank2 } from "react-icons/bs";
import { toast, ToastContainer } from "react-toastify";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { showSpinner, hideSpinner } from "../../utils/spinner";

const baseUrl = "http://13.60.218.94:5001/api";

const PART_A_DOCS = [
  "Last 3 years financials Along with ITR's",
  "Latest year provisionals",
  "Debt sheet",
  "Work order - if applicable",
  "Company profile",
  "Sanction Letters",
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
const ONE_PAGER_DOC = ["OnePager"];

const getDownloadUrl = (filename) => baseUrl + `/documents/downloadNew/${filename}`;

// ✅ Change Status Modal Component
function ChangeStatusModal({ show, onClose, lead, onSubmit }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && lead) {
      setSelectedStatus(lead.status || "");
    }
  }, [show, lead]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStatus || selectedStatus === lead.status) {
      toast.warning("Please select a different status");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(lead.caseid, selectedStatus);
      toast.success("Status updated successfully!");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const statusOptions = [
    { value: "Meeting Done", label: "Meeting Done" },
    { value: "Documentation In Progress", label: "Documentation In Progress" },
    { value: "Underwriting", label: "Underwriting" },
    { value: "One Pager", label: "One Pager" },
    { value: "No Requirement", label: "No Requirement" },
  ];

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "32px",
        minWidth: "450px",
        maxWidth: "90%",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        position: "relative",
        animation: "slideUp 0.3s ease-out"
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: loading ? "not-allowed" : "pointer",
            color: "#666",
            opacity: loading ? 0.5 : 1
          }}
        >
          <FaTimes />
        </button>

        {/* Modal Header */}
        <h2 style={{
          margin: "0 0 8px 0",
          fontSize: "24px",
          fontWeight: "700",
          color: "#333"
        }}>
          Change Status
        </h2>
        <p style={{
          margin: "0 0 24px 0",
          fontSize: "14px",
          color: "#666"
        }}>
          <FaBuilding style={{ marginRight: "6px", color: "#2979ff" }} />
          {lead?.companyname}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Current Status */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#555",
              marginBottom: "8px"
            }}>
              Current Status
            </label>
            <div style={{
              padding: "12px 16px",
              background: "#f8f9fa",
              borderRadius: "8px",
              fontSize: "15px",
              color: "#333",
              fontWeight: "500"
            }}>
              {lead?.status || "N/A"}
            </div>
          </div>

          {/* New Status */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#555",
              marginBottom: "8px"
            }}>
              New Status <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={loading}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "500",
                background: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                outline: "none",
                transition: "border-color 0.2s ease",
                opacity: loading ? 0.6 : 1
              }}
              onFocus={(e) => e.target.style.borderColor = "#2979ff"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            >
              <option value="">-- Select New Status --</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end"
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "12px 24px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                background: "#fff",
                color: "#666",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: loading ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.background = "#f8f9fa";
                  e.target.style.borderColor = "#cbd5e0";
                }
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = "#e2e8f0";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedStatus || selectedStatus === lead?.status}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                background: loading || !selectedStatus || selectedStatus === lead?.status 
                  ? "#cbd5e0" 
                  : "#2979ff",
                color: "#fff",
                cursor: loading || !selectedStatus || selectedStatus === lead?.status 
                  ? "not-allowed" 
                  : "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseOver={(e) => {
                if (!loading && selectedStatus && selectedStatus !== lead?.status) {
                  e.target.style.background = "#1e5bb8";
                }
              }}
              onMouseOut={(e) => {
                if (!loading && selectedStatus && selectedStatus !== lead?.status) {
                  e.target.style.background = "#2979ff";
                }
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #fff",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }}></span>
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const LeadDetailsModal = ({ lead, onClose, handleRefresh }) => {
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const userRoleName = userDetails?.rolename;
  const [leadData, setLeadData] = useState(lead);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, user } = useAuth() || {};
  const [provisionalDocs, setProvisionalDocs] = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);

  const getUploadedDoc = (docname, doctype) =>
    (leadData.documents || []).find(
      (doc) => doc.docname === docname && doc.doctype === doctype
    );

  useEffect(() => {
    setLeadData(lead);
    getProvisionalDocs(lead.caseid);
  }, [lead]);

  const DOC_PERMISSIONS = {
    Operations: {
      partA: { download: true, upload: true, delete: true },
      partB: { download: true, upload: true, delete: true },
      onePager: { download: true, upload: false, delete: false }
    },
    Client: {
      partA: { download: true, upload: true, delete: true },
      partB: { download: true, upload: true, delete: true },
      onePager: { download: true, upload: false, delete: false }
    },
    Individual: {
      partA: { download: true, upload: true, delete: true },
      partB: { download: true, upload: true, delete: true },
      onePager: { download: true, upload: false, delete: false }
    },
    Underwriting: {
      partA: { download: true, upload: false, delete: false },
      partB: { download: true, upload: false, delete: false },
      onePager: { download: true, upload: true, delete: true }
    }
  };

  const updateCaseStatus = async (leadId, status) => {
    setLoading(true);
    setError("");
    try {
      await apiFetch(`/cases/${leadId}/status`, {
        method: "PATCH",
        token,
        body: { status }
      });
      await handleRefresh();
      
      // Update local state
      setLeadData(prev => ({ ...prev, status }));
    } catch (err) {
      setError(err.message || "Failed to update case status");
      throw err; // Re-throw to be caught by modal
    } finally {
      setLoading(false);
    }
  };

  const updateWorkFlow = async (leadId, status) => {
    await apiFetch("/workflow/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: { caseid: leadId, stage: status }
    });
  };

  const handleUpload = async (caseid, doc, part, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caseid", caseid);
    formData.append("doctype", part);
    formData.append("docname", doc);

    try {
      showSpinner();
      const res = await fetch(`${baseUrl}/documents/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });

      hideSpinner();

      if (!res.ok) throw new Error("Upload failed");

      toast.dismiss();
      toast.success(`${doc} uploaded successfully`, {
        toastId: `upload-${caseid}-${doc}`,
        autoClose: 3000
      });

      const updatedCase = await apiFetch(`/cases/${caseid}`, { credentials: "include" });
      leadData.documents = updatedCase.documents || [];
      setLeadData({ ...leadData, documents: updatedCase.documents || [] });

      const allPartADocsUploaded = PART_A_DOCS.every(doc =>
        getUploadedDoc(doc, "partA")
      );

      if (allPartADocsUploaded) {
        updateCaseStatus(leadData.caseid, "Underwriting");
        updateWorkFlow(leadData.caseid, "Underwriting");
      } else if (leadData.status?.toLowerCase() === "meeting done") {
        updateCaseStatus(leadData.caseid, "Documentation In Progress");
      }

      return true;
    } catch (err) {
      toast.dismiss();
      toast.error(`${doc} upload failed`, {
        toastId: `upload-error-${caseid}-${doc}`,
        autoClose: 3000
      });
      return false;
    }
  };

  const handleBulkUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setBulkUploading(true);
    setUploadProgress([]);

    const allDocs = [...PART_A_DOCS, ...PART_B_DOCS];
    let successCount = 0;
    let failedCount = 0;
    const progressUpdates = [];

    for (const file of files) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      
      const matchedDoc = allDocs.find(doc => 
        doc.toLowerCase().includes(fileName.toLowerCase()) ||
        fileName.toLowerCase().includes(doc.toLowerCase())
      );

      if (matchedDoc) {
        const docType = PART_A_DOCS.includes(matchedDoc) ? "partA" : "partB";
        
        progressUpdates.push({
          fileName: file.name,
          docName: matchedDoc,
          status: "uploading",
          type: docType
        });
        setUploadProgress([...progressUpdates]);

        const success = await handleUpload(leadData.caseid, matchedDoc, docType, file);
        
        const lastIndex = progressUpdates.length - 1;
        progressUpdates[lastIndex].status = success ? "success" : "failed";
        setUploadProgress([...progressUpdates]);

        if (success) {
          successCount++;
        } else {
          failedCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        progressUpdates.push({
          fileName: file.name,
          docName: "Unknown",
          status: "skipped",
          type: "unknown"
        });
        setUploadProgress([...progressUpdates]);
        failedCount++;
      }
    }

    setBulkUploading(false);

    if (successCount > 0 && failedCount === 0) {
      toast.success(`✅ All ${successCount} documents uploaded successfully!`);
    } else if (successCount > 0 && failedCount > 0) {
      toast.warning(`⚠️ ${successCount} uploaded, ${failedCount} failed/skipped`);
    } else {
      toast.error(`❌ All uploads failed. Please check file names.`);
    }

    setTimeout(() => setUploadProgress([]), 5000);
  };

  const handleDelete = async (caseid, doc, part) => {
    const match = leadData?.documents?.find(
      d => d.docname?.trim() === doc.trim() && d.doctype === part
    );
    if (!match?.id) return toast.error("No matching document found");

    try {
      showSpinner();
      await fetch(`${baseUrl}/documents/${match.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      hideSpinner();

      toast.success("Document deleted");

      const updatedCase = await apiFetch(`/cases/${caseid}`, { credentials: "include" });
      leadData.documents = updatedCase.documents || [];
      setLeadData({ ...leadData, documents: updatedCase.documents || [] });

      const allPartADocsUploaded = PART_A_DOCS.every(doc =>
        getUploadedDoc(doc, "partA")
      );

      if (!allPartADocsUploaded) {
        updateCaseStatus(leadData.caseid, "Documentation In Progress");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const getProvisionalDocs = async (caseid) => {
    try {
      const res = await apiFetch(`/cases/${caseid}/all-provisional-documents`, { credentials: "include" });
      if (res) {
        setProvisionalDocs(res?.documents?.map(d => d.document_name) || []);
      }
    } catch (err) {
      toast.error("Failed to fetch provisional documents");
    }
  };

  const renderDocActions = (docType, uploaded, filename, fileKey) => {
    let perms = DOC_PERMISSIONS[userRoleName]?.[docType] || {};
    if (docType === "provisional") {
      if (userRoleName === "Operations" || userRoleName === "Client" || userRoleName === "Individual") {
        perms = { download: true, upload: true, delete: true };
      } else if (userRoleName === "Banker") {
        perms = { download: true, upload: false, delete: false };
      } else {
        perms = { download: false, upload: false, delete: false };
      }
    }
    return (
      <span style={{
        marginLeft: 8,
        display: "inline-flex",
        gap: 8,
        alignItems: "center",
        minHeight: "28px"
      }}>
        {perms.download && uploaded && (
          <a
            href={getDownloadUrl(uploaded?.filename)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#2979ff",
              textDecoration: "none",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center"
            }}
            title="Download"
          >
            <FaCloudDownloadAlt />
          </a>
        )}
        {perms.upload && (
          <>
            <input
              type="file"
              style={{ display: "none" }}
              id={`upload-${docType}-${filename || ""}`}
              onChange={e => {
                e.stopPropagation();
                handleUpload(leadData.caseid, filename, docType, e.target.files[0]);
              }}
            />
            <label
              htmlFor={`upload-${docType}-${filename || ""}`}
              style={{
                background: "none",
                border: "none",
                color: "#27ae60",
                cursor: "pointer",
                fontSize: "1.1em",
                display: "inline-flex",
                alignItems: "center",
                margin: 0,
                padding: 0
              }}
              title="Upload"
              onClick={e => e.stopPropagation()}
            >
              <FaCloudUploadAlt />
            </label>
          </>
        )}
        {perms.delete && uploaded && (
          <button
            style={{
              background: "none",
              border: "none",
              color: "#e74c3c",
              cursor: "pointer",
              fontSize: "1.1em",
              display: "inline-flex",
              alignItems: "center",
              padding: "0 !important"
            }}
            title="Delete"
            onClick={e => {
              e.stopPropagation();
              handleDelete(leadData.caseid, filename, docType);
            }}
          >
            <FaTrashAlt />
          </button>
        )}
      </span>
    );
  };

  const kamAssignment = leadData.assignments?.find(assignment =>
    assignment.assigned_to_role === "KAM"
  );

  const canBulkUpload = userRoleName === "Operations" || userRoleName === "Individual";

  return (
    <>
      <div className="lead-details-modal-overlay">
        <div className="lead-details-modal lead-details-modal-flex">
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
          <div className="lead-details-left">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0 }}>
                <FaBuilding /> {leadData.companyname}
              </h2>
              
              
            </div>
            <div className="details-list">
              <div><FaUser /> <strong>Client Name:</strong> {leadData.clientname}</div>
              <div><FaUser /> <strong>SPOC Name:</strong> {leadData.spocname}</div>
              <div><FaEnvelope /> <strong>SPOC Email:</strong> {leadData.spocemail}</div>
              <div><FaPhone /> <strong>SPOC Phone:</strong> {leadData.spocphonenumber}</div>
              <div><FaPhone /> <strong>Company Phone:</strong> {leadData.phonenumber}</div>
              <div><FaEnvelope /> <strong>Company Email:</strong> {leadData.companyemail || "NA"}</div>
              <div><FaMapMarkerAlt /> <strong>Location:</strong> {
                /^https?:\/\//i.test(leadData.location)
                  ? <a href={leadData.location} target="_blank" rel="noopener noreferrer">View</a>
                  : leadData.location
              }</div>
              <div><FaMoneyBillWave /> <strong>Turnover:</strong> {leadData.turnover}</div>
              <div><FaCalendarAlt /> <strong>Date:</strong> {leadData.date}</div>
              <div><FaClock /> <strong>Time:</strong> {leadData.time}</div>
              <div><FaSourcetree /> <strong>Lead Source:</strong> {leadData.leadsource}</div>
              {kamAssignment && (
                <>
                  <div><MdAssignmentInd /> <strong>Assigned KAM:</strong> {kamAssignment.assigned_to_name}</div>
                  <div><FaEnvelope /> <strong>KAM Email:</strong> {kamAssignment.assigned_to_email}</div>
                  <div><FaPhone /> <strong>KAM Phone:</strong> {kamAssignment.phone}</div>
                </>
              )}
              {!kamAssignment && (
                <div><MdAssignmentInd /> <strong>Assigned KAM:</strong> Not Assigned</div>
              )}
              <div><GiProgression /> <strong>Stage:</strong> {leadData.status || "NA"}</div>
              <div><FaCalendarAlt /> <strong>Created On:</strong> {new Date(leadData.createddate).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}</div>
              <div><BsBank2 /> <strong>Bank Name:</strong> {leadData.bankname || "NA"}</div>
              <div><FaComments /><strong>Comments:</strong>
                <ul>
                  {leadData.comments && leadData.comments.length > 0
                    ? leadData.comments.map((c, i) => (
                      <li key={i}>
                        <strong>{c.commentby}:</strong> {c.comment}
                      </li>
                    ))
                    : <li>No comments</li>
                  }
                </ul>
              </div>
            </div>
          </div>
          <div className="lead-details-divider" />
          <div className="lead-details-right">
            <h3>Documents</h3>
            
            {canBulkUpload && (
              <div style={{
                background: "#f8f9fa",
                border: "2px dashed #6c757d",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
                textAlign: "center"
              }}>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  id="bulk-upload-input"
                  onChange={handleBulkUpload}
                  disabled={bulkUploading}
                />
                <label
                  htmlFor="bulk-upload-input"
                  style={{
                    background: "#2979ff",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 24px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: bulkUploading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: bulkUploading ? 0.6 : 1
                  }}
                >
                  <FaUpload />
                  {bulkUploading ? "Uploading..." : "Bulk Upload Documents"}
                </label>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#6c757d" }}>
                  Select multiple files to upload Part A & Part B documents
                </div>

                {uploadProgress.length > 0 && (
                  <div style={{
                    marginTop: "16px",
                    textAlign: "left",
                    maxHeight: "200px",
                    overflowY: "auto",
                    fontSize: "14px"
                  }}>
                    {uploadProgress.map((progress, idx) => (
                      <div key={idx} style={{
                        padding: "8px",
                        marginBottom: "4px",
                        background: progress.status === "success" ? "#d4edda" : 
                                    progress.status === "failed" ? "#f8d7da" : 
                                    progress.status === "skipped" ? "#fff3cd" : "#e7f3ff",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "space-between"
                      }}>
                        <span>{progress.fileName} → {progress.docName}</span>
                        <span style={{ fontWeight: "600" }}>
                          {progress.status === "success" && "✅"}
                          {progress.status === "failed" && "❌"}
                          {progress.status === "skipped" && "⚠️"}
                          {progress.status === "uploading" && "⏳"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="docs-section">
              <div className="docs-part-title">Part A</div>
              <ul>
                {PART_A_DOCS.map((doc, i) => {
                  const uploaded = getUploadedDoc(doc, "partA");
                  const fileKey = `${doc}_partA`;
                  return (
                    <li key={i} className={uploaded ? "doc-available" : "doc-missing"}>
                      <FaFileAlt style={{ marginRight: 6, color: uploaded ? "#2979ff" : "#bbb" }} />
                      {doc}
                      {renderDocActions("partA", uploaded, doc, fileKey)}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="docs-section">
              <div className="docs-part-title">Part B</div>
              <ul>
                {PART_B_DOCS.map((doc, i) => {
                  const uploaded = getUploadedDoc(doc, "partB");
                  const fileKey = `${doc}_partB`;
                  return (
                    <li key={i} className={uploaded ? "doc-available" : "doc-missing"}>
                      <FaFileAlt style={{ marginRight: 6, color: uploaded ? "#2979ff" : "#bbb" }} />
                      {doc}
                      {renderDocActions("partB", uploaded, doc, fileKey)}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="docs-section">
              <div className="docs-part-title">Other Documents</div>
              <ul>
                {provisionalDocs.map((doc, i) => {
                  const uploaded = getUploadedDoc(doc, "provisional");
                  const fileKey = `${doc}_provisional`;
                  return (
                    <li key={i} className={uploaded ? "doc-available" : "doc-missing"}>
                      <FaFileAlt style={{ marginRight: 6, color: uploaded ? "#2979ff" : "#bbb" }} />
                      {doc}
                      {renderDocActions("provisional", uploaded, uploaded?.filename ?? doc, fileKey)}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="docs-section">
              <div className="docs-part-title">One Pager</div>
              <ul>
                {ONE_PAGER_DOC.map((doc, i) => {
                  const uploaded = getUploadedDoc(doc, "onePager");
                  const fileKey = `${doc}_onePager`;
                  return (
                    <li key={i} className={uploaded ? "doc-available" : "doc-missing"}>
                      <FaFileAlt style={{ marginRight: 6, color: uploaded ? "#2979ff" : "#bbb" }} />
                      {doc}
                      {renderDocActions("onePager", uploaded, uploaded?.filename, fileKey)}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
      </div>

      {/* Change Status Modal */}
      <ChangeStatusModal
        show={showChangeStatusModal}
        onClose={() => setShowChangeStatusModal(false)}
        lead={leadData}
        onSubmit={updateCaseStatus}
      />
    </>
  );
};

export default LeadDetailsModal;