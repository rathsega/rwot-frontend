import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    FaArrowLeft, FaBuilding, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, 
    FaMoneyBillWave, FaCalendarAlt, FaClock, FaFileAlt, FaComments, 
    FaCloudDownloadAlt, FaCloudUploadAlt, FaTrashAlt, FaEdit, FaSave,
    FaExchangeAlt, FaHandshake, FaBan, FaTimes, FaPlus
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import "./CaseDetailsPage.css";
import { FaLock } from "react-icons/fa";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

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

const STATUS_OPTIONS = [
    { value: "Meeting Done", label: "Meeting Done" },
    { value: "Documentation In Progress", label: "Documentation In Progress" },
    { value: "Underwriting", label: "Underwriting" },
    { value: "One Pager", label: "One Pager" },
    { value: "No Requirement", label: "No Requirement" },
    { value: "Rejected", label: "Rejected" },
    { value: "Login", label: "Login" },
    { value: "PD", label: "PD" },
    { value: "Sanctioned", label: "Sanctioned" },
    { value: "Disbursed", label: "Disbursed" },
    { value: "Done", label: "Done" },
];

// --- Permission and Readonly Logic ---
const DOC_PERMISSIONS = {
    Operations: { partA: { download: true, upload: true, delete: true }, partB: { download: true, upload: true, delete: true }, provisional: { download: true, upload: true, delete: true }, onePager: { download: true, upload: false, delete: false } },
    Client: { partA: { download: true, upload: true, delete: true }, partB: { download: true, upload: true, delete: true }, provisional: { download: true, upload: true, delete: true }, onePager: { download: true, upload: false, delete: false } },
    Individual: { partA: { download: true, upload: true, delete: true }, partB: { download: true, upload: true, delete: true }, provisional: { download: true, upload: true, delete: true }, onePager: { download: true, upload: false, delete: false } },
    Underwriting: { partA: { download: true, upload: false, delete: false }, partB: { download: true, upload: false, delete: false }, provisional: { download: true, upload: false, delete: false }, onePager: { download: true, upload: true, delete: true } },
    Banker: { partA: { download: true, upload: false, delete: false }, partB: { download: true, upload: false, delete: false }, provisional: { download: true, upload: false, delete: false }, onePager: { download: true, upload: false, delete: false } },
    KAM: { partA: { download: true, upload: true, delete: false }, partB: { download: true, upload: true, delete: false }, provisional: { download: true, upload: false, delete: false }, onePager: { download: true, upload: false, delete: false } },
    Admin: { partA: { download: true, upload: true, delete: true }, partB: { download: true, upload: true, delete: true }, provisional: { download: true, upload: true, delete: true }, onePager: { download: true, upload: false, delete: false } },
};

const getReadonlyFieldsByStatus = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'open': return [];
        case 'meeting done': return ['companyname', 'clientname', 'spocname', 'spocemail', 'spocphonenumber', 'phonenumber', 'companyemail', 'leadsource', 'turnover', 'bankname'];
        case 'documentation initiated':
        case 'documentation in progress': return ['companyname', 'clientname', 'spocname', 'spocemail', 'spocphonenumber', 'phonenumber', 'companyemail', 'leadsource', 'turnover', 'bankname'];
        case 'underwriting':
        case 'one pager':
        case 'banker review':
        case 'no requirement':
            return ['companyname', 'clientname', 'spocname', 'spocemail', 'spocphonenumber', 'phonenumber', 'companyemail', 'leadsource', 'turnover', 'bankname', 'date', 'time', 'location'];
        default: return [];
    }
};

function isFieldReadonly(fieldName, canEdit, caseData) {
    const readonlyFields = getReadonlyFieldsByStatus(caseData?.status);
    return !canEdit || readonlyFields.includes(fieldName);
}

// --- End Permission and Readonly Logic ---
const CaseDetailsPage = () => {
    const { caseid } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth() || {};
    
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [newComment, setNewComment] = useState("");
    const [productModal, setProductModal] = useState(false);
    const [productsList, setProductsList] = useState([]);
    const [kamUsers, setKamUsers] = useState([]);

    useEffect(() => {
        fetchCaseDetails();
        fetchProductsList();
        fetchKamUsers();
    }, [caseid]);

    const fetchCaseDetails = async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`/cases/${caseid}`, { method: "GET", token });
            setCaseData(res.case || res);
            setEditForm(res.case || res);
        } catch (err) {
            setError(err.message || "Failed to fetch case details");
        } finally {
            setLoading(false);
        }
    };

    const fetchProductsList = async () => {
        try {
            const res = await apiFetch("/banks", { method: "GET", token });
            const banks = res.banks || res || [];
            const allProducts = banks.flatMap(b => {
                try {
                    return typeof b.products === "string" ? JSON.parse(b.products) : (b.products || []);
                } catch { return []; }
            });
            setProductsList([...new Set(allProducts)]);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        }
    };

    const fetchKamUsers = async () => {
        try {
            const res = await apiFetch("/users/getKamAndTelecallers", { method: "GET", token });
            const users = res.users || res || [];
            setKamUsers(users.filter(u => u.rolename === "KAM"));
        } catch (err) {
            console.error("Failed to fetch KAM users:", err);
        }
    };

    const handleSaveEdit = async () => {
        try {
            await apiFetch(`/cases/edit/${caseid}`, {
                method: "PUT",
                token,
                body: JSON.stringify(editForm)
            });
            toast.success("Case updated successfully!");
            setIsEditing(false);
            fetchCaseDetails();
        } catch (err) {
            toast.error(err.message || "Failed to update case");
        }
    };

    const handleStatusUpdate = async (newStatus, productsData = null, description = "") => {
        try {
            await apiFetch(`/cases/${caseid}/status`, {
                method: "PATCH",
                token,
                body: JSON.stringify({ 
                    status: newStatus, 
                    products: productsData,
                    description 
                })
            });
            toast.success("Status updated successfully!");
            fetchCaseDetails();
            setProductModal(false);
        } catch (err) {
            toast.error(err.message || "Failed to update status");
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            await apiFetch(`/comments`, {
                method: "POST",
                token,
                body: JSON.stringify({ caseid, comment: newComment })
            });
            toast.success("Comment added!");
            setNewComment("");
            fetchCaseDetails();
        } catch (err) {
            toast.error(err.message || "Failed to add comment");
        }
    };

    const handleFileUpload = async (docname, doctype, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("caseid", caseid);
        formData.append("doctype", doctype);
        formData.append("docname", docname);

        try {
            const res = await fetch(`${baseUrl}/documents/upload`, {
                method: "POST",
                body: formData,
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Upload failed");
            toast.success(`${docname} uploaded successfully!`);
            fetchCaseDetails();
        } catch (err) {
            toast.error(`Failed to upload ${docname}`);
        }
    };

    const getUploadedDoc = (docname, doctype) =>
        (caseData?.documents || []).find(d => d.docname === docname && d.doctype === doctype);

    const canEdit = user?.rolename === "KAM" || user?.rolename === "Operations" || user?.rolename === "Admin";

    if (loading) {
        return (
            <div className="case-details-loading">
                <div className="spinner"></div>
                <p>Loading case details...</p>
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="case-details-error">
                <p>{error || "Case not found"}</p>
                <button onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    const assignedKamObj = caseData?.assignments?.find(a => a.assigned_to_role === "KAM");
    const telecallerObj = caseData?.assignments?.find(a => a.assigned_to_role === "Telecaller");
    const operationsObj = caseData?.assignments?.find(a => a.assigned_to_role === "Operations");

    return (
        <div className="case-details-page">
            <ToastContainer position="top-right" autoClose={3000} />
            
            {/* Header */}
            <div className="case-details-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>
                <div className="header-info">
                    <h1><FaBuilding /> {caseData.companyname}</h1>
                    <span className="case-id">Case ID: {caseData.caseid}</span>
                </div>
                <div className="header-actions">
                    {canEdit && !isEditing && (
                        <button className="btn-edit" onClick={() => setIsEditing(true)}>
                            <FaEdit /> Edit
                        </button>
                    )}
                    {isEditing && (
                        <>
                            <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                                <FaTimes /> Cancel
                            </button>
                            <button className="btn-save" onClick={handleSaveEdit}>
                                <FaSave /> Save
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="case-status-bar">
                <div className="status-info">
                    <span className="status-label">Status:</span>
                    <span className={`status-badge status-${caseData.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {caseData.status}
                    </span>
                </div>
                <div className="status-actions">

                    <button 
                        className="btn-no-requirement"
                        onClick={() => handleStatusUpdate("No Requirement")}
                    >
                        <FaBan /> No Requirement
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontWeight: '600', color: '#555', whiteSpace: 'nowrap' }}>Change Status:</label>
                        <select 
                            className="status-dropdown"
                            value={caseData.status}
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                fontSize: '14px',
                                cursor: 'pointer',
                                minWidth: '180px'
                            }}
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* All Sections in Compact Grid Layout */}
            <div className="compact-grid-layout">
                {/* Client Info Card */}
                <div className="compact-card">
                    <div className="compact-card-header">
                        <FaBuilding /> <span>Client Information</span>
                    </div>
                    <div className="compact-card-body">
                        <div className="compact-row">
                            <span className="compact-label">Company</span>
                            <span className="compact-value">
                                {isEditing ? (
                                    <input 
                                        value={editForm.companyname || ""}
                                        onChange={e => setEditForm({ ...editForm, companyname: e.target.value })}
                                        className="compact-input"
                                    />
                                ) : (caseData.companyname || "-")}
                            </span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Client</span>
                            <span className="compact-value">
                                {isEditing ? (
                                    <input 
                                        value={editForm.clientname || ""}
                                        onChange={e => setEditForm({ ...editForm, clientname: e.target.value })}
                                        className="compact-input"
                                    />
                                ) : (caseData.clientname || "-")}
                            </span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Phone</span>
                            <span className="compact-value">
                                {isEditing ? (
                                    <input 
                                        value={editForm.phonenumber || ""}
                                        onChange={e => setEditForm({ ...editForm, phonenumber: e.target.value })}
                                        className="compact-input"
                                    />
                                ) : (caseData.phonenumber || "-")}
                            </span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Email</span>
                            <span className="compact-value">
                                {isEditing ? (
                                    <input 
                                        value={editForm.spocemail || ""}
                                        onChange={e => setEditForm({ ...editForm, spocemail: e.target.value })}
                                        className="compact-input"
                                    />
                                ) : (caseData.spocemail || "-")}
                            </span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Location</span>
                            <span className="compact-value">
                                {isEditing ? (
                                    <input 
                                        value={editForm.location || ""}
                                        onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                        className="compact-input"
                                    />
                                ) : (caseData.location || "-")}
                            </span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Turnover</span>
                            <span className="compact-value">
                                {isEditing ? (
                                    <input 
                                        value={editForm.turnover || ""}
                                        onChange={e => setEditForm({ ...editForm, turnover: e.target.value })}
                                        className="compact-input"
                                    />
                                ) : (caseData.turnover || "-")}
                            </span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Lead Source</span>
                            <span className="compact-value">
                                {isEditing ? (
                                    <input 
                                        value={editForm.leadsource || ""}
                                        onChange={e => setEditForm({ ...editForm, leadsource: e.target.value })}
                                        className="compact-input"
                                    />
                                ) : (caseData.leadsource || "-")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SPOC Card */}
                <div className="compact-card">
                    <div className="compact-card-header">
                        <FaUser /> <span>SPOC Details</span>
                    </div>
                    <div className="compact-card-body">
                        <div className="compact-row">
                            <span className="compact-label">Name</span>
                            <span className="compact-value">
                                {isEditing ? (
                                    <input 
                                        value={editForm.spocname || ""}
                                        onChange={e => setEditForm({ ...editForm, spocname: e.target.value })}
                                        className="compact-input"
                                    />
                                ) : (caseData.spocname || "-")}
                            </span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Email</span>
                            <span className="compact-value">
                                {isEditing ? (
                                    <input 
                                        value={editForm.spocemail || ""}
                                        onChange={e => setEditForm({ ...editForm, spocemail: e.target.value })}
                                        className="compact-input"
                                    />
                                ) : (caseData.spocemail || "-")}
                            </span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Phone</span>
                            <span className="compact-value">
                                {isEditing ? (
                                    <input 
                                        value={editForm.spocphonenumber || ""}
                                        onChange={e => setEditForm({ ...editForm, spocphonenumber: e.target.value })}
                                        className="compact-input"
                                    />
                                ) : (caseData.spocphonenumber || "-")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* KAM Card */}
                <div className="compact-card">
                    <div className="compact-card-header">
                        <FaUser /> <span>Assigned KAM</span>
                    </div>
                    <div className="compact-card-body">
                        <div className="compact-row">
                            <span className="compact-label">Name</span>
                            <span className="compact-value">{assignedKamObj?.assigned_to_name || "Not Assigned"}</span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Email</span>
                            <span className="compact-value">{assignedKamObj?.assigned_to_email || "-"}</span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Phone</span>
                            <span className="compact-value">{assignedKamObj?.phone || "-"}</span>
                        </div>
                    </div>
                </div>

                {/* Telecaller Card */}
                <div className="compact-card">
                    <div className="compact-card-header">
                        <FaPhone /> <span>Telecaller</span>
                    </div>
                    <div className="compact-card-body">
                        <div className="compact-row">
                            <span className="compact-label">Name</span>
                            <span className="compact-value">{telecallerObj?.assigned_to_name || "Not Assigned"}</span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Email</span>
                            <span className="compact-value">{telecallerObj?.assigned_to_email || "-"}</span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Phone</span>
                            <span className="compact-value">{telecallerObj?.phone || "-"}</span>
                        </div>
                    </div>
                </div>

                {/* Operations Card */}
                <div className="compact-card">
                    <div className="compact-card-header">
                        <FaUser /> <span>Operations</span>
                    </div>
                    <div className="compact-card-body">
                        <div className="compact-row">
                            <span className="compact-label">Name</span>
                            <span className="compact-value">{operationsObj?.assigned_to_name || "Not Assigned"}</span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Email</span>
                            <span className="compact-value">{operationsObj?.assigned_to_email || "-"}</span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Phone</span>
                            <span className="compact-value">{operationsObj?.phone || "-"}</span>
                        </div>
                    </div>
                </div>

                {/* Meeting Card */}
                <div className="compact-card">
                    <div className="compact-card-header">
                        <FaCalendarAlt /> <span>Meeting Details</span>
                    </div>
                    <div className="compact-card-body">
                        <div className="compact-row">
                            <span className="compact-label">Date</span>
                            <span className="compact-value">{caseData.date ? dayjs(caseData.date).format("DD MMM YYYY") : "Not Scheduled"}</span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Time</span>
                            <span className="compact-value">{caseData.time || "Not Set"}</span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Location</span>
                            <span className="compact-value">{caseData.location || "Not Specified"}</span>
                        </div>
                    </div>
                </div>

                {/* Timeline Card */}
                <div className="compact-card">
                    <div className="compact-card-header">
                        <FaClock /> <span>Timeline</span>
                    </div>
                    <div className="compact-card-body">
                        <div className="compact-row">
                            <span className="compact-label">Created</span>
                            <span className="compact-value">{caseData.createddate ? dayjs(caseData.createddate).format("DD MMM YYYY") : "N/A"}</span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Updated</span>
                            <span className="compact-value">{caseData.updatedat ? dayjs(caseData.updatedat).format("DD MMM YY, HH:mm") : "N/A"}</span>
                        </div>
                        <div className="compact-row">
                            <span className="compact-label">Status Changed</span>
                            <span className="compact-value">{caseData.status_updated_on ? dayjs(caseData.status_updated_on).format("DD MMM YY, HH:mm") : "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* Requirements Card */}
                <div className="compact-card compact-card-wide">
                    <div className="compact-card-header">
                        <FaMoneyBillWave /> <span>Product Requirements</span>
                        <button className="compact-add-btn" onClick={() => setProductModal(true)}>
                            <FaPlus /> Add
                        </button>
                    </div>
                    <div className="compact-card-body">
                        {(Array.isArray(caseData.product_requirements) && caseData.product_requirements.length > 0) ? (
                            <>
                                <div className="compact-requirements-list">
                                    {caseData.product_requirements.map((pr, idx) => (
                                        <div key={idx} className="compact-requirement-item">
                                            <span className="req-product">{pr.productname || pr.product || "-"}</span>
                                            <span className="req-amount">₹{pr.requirement_amount ? Number(pr.requirement_amount).toLocaleString('en-IN') : (pr.amount ? Number(pr.amount).toLocaleString('en-IN') : "-")}</span>
                                        </div>
                                    ))}
                                </div>
                                {caseData.product_requirements[0]?.description && (
                                    <div className="compact-requirement-description">
                                        <strong>Description:</strong> {caseData.product_requirements[0].description}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="compact-empty">No requirements yet</div>
                        )}
                    </div>
                </div>

                {/* Documents Summary Card */}
                <div className="compact-card compact-card-wide">
                    <div className="compact-card-header">
                        <FaFileAlt /> <span>Documents</span>
                    </div>
                    <div className="compact-card-body">
                        <div className="compact-docs-summary">
                            <div className="docs-summary-section">
                                <span className="docs-summary-title">Part A</span>
                                <div className="docs-summary-stats">
                                    <span className="docs-uploaded">{PART_A_DOCS.filter(d => getUploadedDoc(d, "partA")).length}/{PART_A_DOCS.length} uploaded</span>
                                </div>
                                <div className="docs-mini-list">
                                    {PART_A_DOCS.map(doc => {
                                        const uploaded = getUploadedDoc(doc, "partA");
                                        return (
                                            <div key={doc} className={`docs-mini-item ${uploaded ? 'uploaded' : ''}`}>
                                                <span className="mini-doc-name" title={doc}>{doc.length > 25 ? doc.slice(0, 25) + '...' : doc}</span>
                                                {uploaded ? (
                                                    <a href={`${baseUrl}/documents/downloadNew/${uploaded.filename}`} target="_blank" rel="noreferrer" className="mini-download">
                                                        <FaCloudDownloadAlt />
                                                    </a>
                                                ) : (
                                                    <label className="mini-upload">
                                                        <FaCloudUploadAlt />
                                                        <input type="file" hidden onChange={(e) => handleFileUpload(doc, "partA", e.target.files[0])} />
                                                    </label>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="docs-summary-section">
                                <span className="docs-summary-title">Part B</span>
                                <div className="docs-summary-stats">
                                    <span className="docs-uploaded">{PART_B_DOCS.filter(d => getUploadedDoc(d, "partB")).length}/{PART_B_DOCS.length} uploaded</span>
                                </div>
                                <div className="docs-mini-list">
                                    {PART_B_DOCS.map(doc => {
                                        const uploaded = getUploadedDoc(doc, "partB");
                                        return (
                                            <div key={doc} className={`docs-mini-item ${uploaded ? 'uploaded' : ''}`}>
                                                <span className="mini-doc-name" title={doc}>{doc.length > 25 ? doc.slice(0, 25) + '...' : doc}</span>
                                                {uploaded ? (
                                                    <a href={`${baseUrl}/documents/downloadNew/${uploaded.filename}`} target="_blank" rel="noreferrer" className="mini-download">
                                                        <FaCloudDownloadAlt />
                                                    </a>
                                                ) : (
                                                    <label className="mini-upload">
                                                        <FaCloudUploadAlt />
                                                        <input type="file" hidden onChange={(e) => handleFileUpload(doc, "partB", e.target.files[0])} />
                                                    </label>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments Card */}
                <div className="compact-card compact-card-full">
                    <div className="compact-card-header">
                        <FaComments /> <span>Comments ({(caseData.comments || []).length})</span>
                    </div>
                    <div className="compact-card-body">
                        <div className="compact-add-comment">
                            <input 
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                            <button onClick={handleAddComment}><FaPlus /></button>
                        </div>
                        <div className="compact-comments-list">
                            {(caseData.comments || []).slice(0, 5).map((comment, idx) => (
                                <div key={idx} className="compact-comment">
                                    <div className="comment-meta">
                                        <span className="comment-by">{comment.commentby || "System"}</span>
                                        <span className="comment-time">{dayjs(comment.created_at).format("DD MMM, HH:mm")}</span>
                                    </div>
                                    <p className="comment-text">{comment.comment}</p>
                                </div>
                            ))}
                            {(!caseData.comments || caseData.comments.length === 0) && (
                                <div className="compact-empty">No comments yet</div>
                            )}
                            {(caseData.comments || []).length > 5 && (
                                <div className="more-comments">+{caseData.comments.length - 5} more comments</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Requirements Modal */}
            {productModal && (
                <ProductRequirementModal 
                    show={productModal}
                    onClose={() => setProductModal(false)}
                    existingProducts={caseData.product_requirements || []}
                    productsList={productsList}
                    onSubmit={(prods, desc) => handleStatusUpdate("Meeting Done", prods, desc)}
                />
            )}
        </div>
    );
};

// Helper Components
const InfoCard = ({ icon, label, value }) => (
    <div className="info-card">
        <div className="info-icon">{icon}</div>
        <div className="info-content">
            <span className="info-label">{label}</span>
            <span className="info-value">{typeof value === 'string' ? value : value}</span>
        </div>
    </div>
);

const DocumentRow = ({ docName, uploaded, onUpload }) => (
    <div className={`doc-row ${uploaded ? 'uploaded' : ''}`}>
        <span className="doc-name">{docName}</span>
        <div className="doc-actions">
            {uploaded ? (
                <>
                    <a 
                        href={`${baseUrl}/documents/downloadNew/${uploaded.filename}`}
                        className="btn-download"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FaCloudDownloadAlt /> Download
                    </a>
                    <span className="upload-date">
                        {dayjs(uploaded.uploadedat).format("DD MMM")}
                    </span>
                </>
            ) : (
                <label className="btn-upload">
                    <FaCloudUploadAlt /> Upload
                    <input 
                        type="file" 
                        hidden 
                        onChange={(e) => onUpload(e.target.files[0])}
                    />
                </label>
            )}
        </div>
    </div>
);

// Product Requirement Modal (reused from LeadCard)
const ProductRequirementModal = ({ show, onClose, onSubmit, existingProducts, productsList }) => {
    const [products, setProducts] = useState([{ product: "", amount: "" }]);
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (existingProducts && existingProducts.length > 0) {
            setProducts(existingProducts.map(p => ({
                product: p.productname || p.product || "",
                amount: p.requirement_amount || p.amount || ""
            })));
            setDescription(existingProducts[0]?.description || "");
        } else {
            setProducts([{ product: "", amount: "" }]);
            setDescription("");
        }
    }, [existingProducts, show]);

    const handleAddProduct = () => setProducts([...products, { product: "", amount: "" }]);
    const handleRemoveProduct = (idx) => products.length > 1 && setProducts(products.filter((_, i) => i !== idx));
    const handleChange = (idx, field, value) => {
        const updated = [...products];
        updated[idx][field] = value;
        setProducts(updated);
    };

    const isValid = products.every(p => p.product && p.amount);

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content product-modal">
                <div className="modal-header">
                    <h3>Update Products & Requirements</h3>
                    <button className="modal-close" onClick={onClose}><FaTimes /></button>
                </div>
                
                <div className="modal-body">
                    <div className="products-header">
                        <label>Products & Amounts</label>
                        <button className="btn-add" onClick={handleAddProduct}>+ Add Product</button>
                    </div>
                    
                    {products.map((item, idx) => (
                        <div key={idx} className="product-input-row">
                            <select
                                value={item.product}
                                onChange={e => handleChange(idx, "product", e.target.value)}
                            >
                                <option value="">Select product</option>
                                {productsList.map((p, i) => <option key={i} value={p}>{p}</option>)}
                            </select>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={item.amount}
                                onChange={e => handleChange(idx, "amount", e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="Amount"
                            />
                            {products.length > 1 && (
                                <button 
                                    type="button"
                                    className="btn-remove" 
                                    onClick={() => handleRemoveProduct(idx)}
                                    style={{
                                        background: '#e74c3c',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '28px',
                                        height: '28px',
                                        minWidth: '28px',
                                        minHeight: '28px',
                                        padding: 0,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        transition: 'background 0.2s ease',
                                        marginLeft: '8px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#c0392b'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#e74c3c'}
                                    title="Remove product"
                                >
                                    <FaTimes style={{ fontSize: '12px', color: '#fff' }} />
                                </button>
                            )}
                        </div>
                    ))}

                    <div className="description-field">
                        <label>Requirement Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Enter detailed description..."
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button 
                        className="btn-save" 
                        onClick={() => onSubmit(products, description)}
                        disabled={!isValid}
                    >
                        Save & Update
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CaseDetailsPage;
