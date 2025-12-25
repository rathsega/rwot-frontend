import React from "react";
import { FaTimes, FaBuilding, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaClock, FaFileAlt, FaSourcetree, FaComments, FaCloudDownloadAlt, FaCloudUploadAlt, FaTrashAlt } from "react-icons/fa";
import { MdAssignmentInd } from "react-icons/md";
import { GiProgression } from "react-icons/gi";
import { BsBank2 } from "react-icons/bs";
// import "./LeadDetailsModal.css";

const PART_A_DOCS = [
  "Last 3 years financials Along with ITR’s",
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
    "Cma data"
];

const getDownloadUrl = (filename) => `/api/uploads/${filename}`;

const LeadDetailsModal = ({ lead, onClose }) => {
    // Here need to set userRole, should get it from localStorage, 
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const userRoleName = userDetails?.rolename;

  // Helper to get uploaded doc by name and type
  const getUploadedDoc = (docname, doctype) =>
    (lead.documents || []).find(
      (doc) => doc.docname === docname && doc.doctype === doctype
    );

 // Permissions object
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
    Underwriting: {
      partA: { download: true, upload: false, delete: false },
      partB: { download: true, upload: false, delete: false },
      onePager: { download: true, upload: true, delete: true }
    }
  };

  // Helper to show icons based on permissions
  const renderDocActions = (docType, uploaded, filename) => {
    const perms = DOC_PERMISSIONS[userRoleName]?.[docType] || {};
    return (
      <span style={{ marginLeft: 8, display: "inline-flex", gap: 8 }}>
        {perms.download && uploaded && (
          <a
            href={getDownloadUrl(filename)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2979ff", textDecoration: "none", fontWeight: 500 }}
            title="Download"
          >
            <FaCloudDownloadAlt />
          </a>
        )}
        {perms.upload && (
          <button
            style={{
              background: "none",
              border: "none",
              color: "#27ae60",
              cursor: "pointer",
              fontSize: "1.1em"
            }}
            title="Upload"
            onClick={e => {
              e.stopPropagation();
              // TODO: Implement upload logic/modal
              alert("Upload clicked!");
            }}
          >
            <FaCloudUploadAlt />
          </button>
        )}
        {perms.delete && uploaded && (
          <button
            style={{
              background: "none",
              border: "none",
              color: "#e74c3c",
              cursor: "pointer",
              fontSize: "1.1em"
            }}
            title="Delete"
            onClick={e => {
              e.stopPropagation();
              // TODO: Implement delete logic/modal
              alert("Delete clicked!");
            }}
          >
            <FaTrashAlt />
          </button>
        )}
      </span>
    );
  };

  return (
    <div className="lead-details-modal-overlay">
      <div className="lead-details-modal lead-details-modal-flex">
        <button className="close-btn" onClick={onClose}><FaTimes /></button>
        <div className="lead-details-left">
          <h2><FaBuilding /> {lead.companyname}</h2>
          <div className="details-list">
            <div><FaUser /> <strong>Client Name:</strong> {lead.clientname}</div>
            <div><FaUser /> <strong>SPOC Name:</strong> {lead.spocname}</div>
            <div><FaEnvelope /> <strong>SPOC Email:</strong> {lead.spocemail}</div>
            <div><FaPhone /> <strong>SPOC Phone:</strong> {lead.spocphonenumber}</div>
            <div><FaPhone /> <strong>Company Phone:</strong> {lead.phonenumber}</div>
            <div><FaEnvelope /> <strong>Company Email:</strong> {lead.companyemail || "NA"}</div>
            <div><FaMapMarkerAlt /> <strong>Location:</strong> {
              /^https?:\/\//i.test(lead.location)
                ? <a href={lead.location} target="_blank" rel="noopener noreferrer">View</a>
                : lead.location
            }</div>
            <div><FaMoneyBillWave /> <strong>Turnover:</strong> {lead.turnover}</div>
            <div><FaCalendarAlt /> <strong>Date:</strong> {lead.date}</div>
            <div><FaClock /> <strong>Time:</strong> {lead.time}</div>
            <div><FaSourcetree /> <strong>Lead Source:</strong> {lead.leadsource}</div>
            <div><MdAssignmentInd /> <strong>Assigned To:</strong> {lead.assigned_to_name}</div>
            <div><FaEnvelope /> <strong>Assigned Email:</strong> {lead.assigned_to_email}</div>
            <div><GiProgression /> <strong>Stage:</strong> {lead.stage || "NA"}</div>
            <div><BsBank2 /> <strong>Bank Name:</strong> {lead.bankname || "NA"}</div>
            <div><FaComments /><strong>Comments:</strong>
              <ul>
                {lead.comments && lead.comments.length > 0
                  ? lead.comments.map((c, i) => (
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
          <div className="docs-section">
            <div className="docs-part-title">Part A</div>
            <ul>
              {PART_A_DOCS.map((doc, i) => {
                const uploaded = getUploadedDoc(doc, "partA");
                return (
                  <li key={i} className={uploaded ? "doc-available" : "doc-missing"}>
                    <FaFileAlt style={{ marginRight: 6, color: uploaded ? "#2979ff" : "#bbb" }} />

                    {uploaded ? (
                      <>{doc} <a
                        href={getDownloadUrl(uploaded.filename)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#2979ff", textDecoration: "underline", marginLeft: 8, fontWeight: 500 }}
                      >
                        <FaCloudDownloadAlt />
                      </a></>
                    ) : (
                      <span style={{ color: "#bbb", marginLeft: 8, fontStyle: "italic" }}>{doc}</span>
                    )}
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
                return (
                  <li key={i} className={uploaded ? "doc-available" : "doc-missing"}>
                    <FaFileAlt style={{ marginRight: 6, color: uploaded ? "#2979ff" : "#bbb" }} />

                    {uploaded ? (
                      <>{doc}
                        <a
                          href={getDownloadUrl(uploaded.filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#2979ff", textDecoration: "underline", marginLeft: 8, fontWeight: 500 }}
                        >
                          <FaCloudDownloadAlt />
                        </a>
                      </>
                    ) : (
                      <span style={{ color: "#bbb", marginLeft: 8, fontStyle: "italic" }}>{doc}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;