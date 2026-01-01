import React, { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaMoneyBillWave, FaExchangeAlt, FaFileAlt, FaProductHunt, FaCopy, FaUserTie, FaEdit, FaTimes } from 'react-icons/fa';
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { GrUserSettings } from "react-icons/gr";
import { MdAddHome } from "react-icons/md";
import ProvisionalDocsModal from "./ProvisionalDocsModal";
import AssignBankerModal from "./AssignBankerModal";
import { MdNoteAdd } from "react-icons/md";
import dayjs from "dayjs";
import { formatIndianCurrency } from "../../utils/formatters";
import ChangeStatusModal from './ChangeStatusModal';
import useProducts from "../../hooks/useProducts";

// Edit Lead Modal
function EditLeadModal({ show, onClose, lead, onSubmit, kamUsers }) {
    const [form, setForm] = useState({
        companyname: "",
        clientname: "",
        phonenumber: "",
        leadsource: "",
        turnover: "",
        turnoverType: "",
        location: "",
        spocname: "",
        spocemail: "",
        spocphonenumber: "",
        date: "",
        time: "",
        comments: "",
        assignedKam: "",
        productname: "",
        requirement_amount: "",
        new_comments: ""
    });

    const required = ["companyname", "clientname", "phonenumber", "date", "time"];
    const [formError, setFormError] = useState("");
    const { products: productsList } = useProducts();

    useEffect(() => {
        if (lead) {
            const predefinedRanges = ["1-5cr", "5-25cr", "25-50cr", "50-100cr", "100+ cr"];
            const turnoverType = predefinedRanges.includes(lead.turnover) ? lead.turnover : "Others";

            setForm({
                companyname: lead.companyname || "",
                clientname: lead.clientname || "",
                phonenumber: lead.phonenumber || "",
                leadsource: lead.leadsource || "",
                turnover: turnoverType === "Others" ? lead.turnover : "",
                turnoverType: turnoverType,
                location: lead.location || "",
                spocname: lead.spocname || "",
                spocemail: lead.spocemail || "",
                spocphonenumber: lead.spocphonenumber || "",
                date: lead.date || "",
                time: lead.time || "",
                comments: lead.comments || "",
                assignedKam: lead.assignedKam || "",
                productname: lead.productname || "",
                requirement_amount: lead.requirement_amount || "",
                new_comments: ""
            });
        }
    }, [lead]);

    const handleSave = () => {
        const missing = required.filter((k) => {
            const v = form[k];
            if (typeof v === 'string') return !v.trim();
            return !v;
        });
        if (missing.length > 0) {
            setFormError("Missing: " + missing.join(", "));
            return;
        }
        if (form.phonenumber && !/^\d{10}$/.test(form.phonenumber.trim())) {
            setFormError("Phone number must be 10 digits.");
            return;
        }

        const finalTurnover = form.turnoverType === "Others" ? form.turnover : form.turnoverType;
        onSubmit({ ...form, turnover: finalTurnover, comments: form["new_comments"] });
    };

    if (!show) return null;

    const styles = {
        modalOverlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(38, 47, 73, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
        },
        modal: {
            background: "#fff",
            padding: 24,
            borderRadius: 16,
            boxShadow: "0 8px 42px 0 rgba(18,38,63,0.17)",
            minWidth: 420,
            maxWidth: 820,
            maxHeight: "90vh"
        },
        input: {
            width: "100%",
            padding: "9px 13px",
            border: "1px solid #dadada",
            borderRadius: 8,
            fontSize: 15,
            background: "#f8fafd",
            fontWeight: 500,
            outline: "none"
        }
    };

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modal}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <h3 style={{ fontWeight: 700 }}>Edit Lead</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#555" }}>
                        <FaTimes />
                    </button>
                </div>

                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 16,
                    maxHeight: "60vh",
                    overflowY: "auto",
                    paddingRight: "8px"
                }}>
                    {[
                        ["Company Name", "companyname"],
                        ["Client Name", "clientname"],
                        ["Mobile", "phonenumber"],
                        ["Lead Source", "leadsource"],
                        ["Turnover", "turnover"],
                        ["Location", "location"],
                        ["SPOC Name", "spocname"],
                        ["SPOC Email", "spocemail"],
                        ["SPOC Phone", "spocphonenumber"],
                        ["Date", "date"],
                        ["Time", "time"],
                        ["Product Name", "productname"],
                        ["Requirement Amount", "requirement_amount"],
                        ["Comments", "comments"]
                    ].map(([label, key]) => (
                        <div key={key} style={{ flex: "1 1 44%" }}>
                            <label style={{ fontWeight: 600 }}>
                                {label} {required.includes(key) && <span style={{ color: "#e53935" }}>*</span>}
                            </label>
                            {key === "time" ? (
                                <select
                                    value={form[key] || ""}
                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    style={styles.input}
                                >
                                    <option value="">Select Time</option>
                                    {Array.from({ length: 48 }, (_, i) => {
                                        const hours = Math.floor(i / 2);
                                        const minutes = (i % 2) * 30;
                                        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                                        return (
                                            <option key={timeString} value={timeString}>
                                                {timeString}
                                            </option>
                                        );
                                    })}
                                </select>
                            ) : key === "turnover" ? (
                                <div>
                                    <select
                                        value={form.turnoverType || ""}
                                        onChange={e => {
                                            setForm(f => ({
                                                ...f,
                                                turnoverType: e.target.value,
                                                turnover: e.target.value === "Others" ? "" : e.target.value
                                            }));
                                        }}
                                        style={styles.input}
                                    >
                                        <option value="">Select Turnover Range</option>
                                        <option value="1-5cr">1-5 Cr</option>
                                        <option value="5-25cr">5-25 Cr</option>
                                        <option value="25-50cr">25-50 Cr</option>
                                        <option value="50-100cr">50-100 Cr</option>
                                        <option value="100+ cr">100+ Cr</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    {form.turnoverType === "Others" && (
                                        <input
                                            type="text"
                                            value={form.turnover || ""}
                                            onChange={e => setForm(f => ({ ...f, turnover: e.target.value }))}
                                            style={{ ...styles.input, marginTop: 8 }}
                                            placeholder="Enter custom turnover amount"
                                        />
                                    )}
                                </div>
                            ) : key === "comments" ? (
                                <input
                                    type="text"
                                    value={form["new_comments"] || ""}
                                    onChange={e => setForm(f => ({ ...f, ["new_comments"]: e.target.value }))}
                                    style={styles.input}
                                    placeholder="Enter comments"
                                />
                            ) : key === "productname" ? (
                                <select
                                    value={form[key] || ""}
                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    style={{
                                        width: "100%",
                                        padding: 8,
                                        borderRadius: 6,
                                        border: "1.5px solid #d1d5db",
                                        marginTop: 6,
                                        fontSize: 15,
                                        background: "#fff"
                                    }}>
                                    <option value="">Select Product</option>
                                    {productsList?.map((p, idx) => (
                                        <option key={idx} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={key === "date" ? "date" : key === "requirement_amount" ? "number" : "text"}
                                    value={form[key] || ""}
                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    style={styles.input}
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                />
                            )}
                        </div>
                    ))}

                    <div style={{ flex: "1 1 44%" }}>
                        <label style={{ fontWeight: 600 }}>Assign KAM</label>
                        <select
                            value={form.assignedKam || ""}
                            onChange={(e) => setForm({ ...form, assignedKam: e.target.value })}
                            style={styles.input}
                        >
                            <option value="">Select KAM</option>
                            {kamUsers?.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {formError && <div style={{ color: "#e53935", marginTop: 10 }}>{formError}</div>}
                <div style={{ textAlign: "right", marginTop: 16 }}>
                    <button
                        onClick={handleSave}
                        style={{
                            background: "#2979ff",
                            color: "#fff",
                            borderRadius: 8,
                            padding: "9px 24px",
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

const ProgressCard = ({ lead, bgClass, cardClick, handleRefresh, kamUsers }) => {
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");
    const [error, setError] = useState("");
    const { token, user } = useAuth() || {};
    const [banks, setBanks] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignedBankers, setAssignedBankers] = useState([]);
    const [docConfig, setDocConfig] = useState({});
    const [showProvisionalModal, setShowProvisionalModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editStatusModal, setEditStatusModal] = useState(false);

    const updateCaseStatus = (leadId, status) => {
        setLoading(true);
        setError("");
        apiFetch(`/cases/${leadId}/status`, {
            method: "PATCH",
            token,
            body: JSON.stringify({ status })
        })
            .then((res) => {
                handleRefresh();
                setToast("Case status updated successfully!");
            })
            .catch((err) => setError(err.message || "Failed to update case status"))
            .finally(() => setLoading(false));
    };

    const handleEditSubmit = (updatedData) => {
        setLoading(true);
        setError("");

        if (updatedData?.comments) {
            updatedData.comments = Array.isArray(updatedData.comments)
                ? updatedData.comments
                : [updatedData.comments];
        }

        if (updatedData?.new_comments) {
            updatedData.comments = updatedData.new_comments;
            delete updatedData.new_comments;
        }

        apiFetch(`/cases/edit/${lead.caseid}`, {
            method: "PUT",
            token,
            body: JSON.stringify(updatedData)
        })
            .then((res) => {
                handleRefresh();
                setToast("Lead updated successfully!");
                setShowEditModal(false);
            })
            .catch((err) => {
                setError(err.message || "Failed to update lead");
                setToast(err.message || "Failed to update lead");
            })
            .finally(() => setLoading(false));
    };

    const generateClient = (leadId, type) => {
        setLoading(true);
        setError("");
        apiFetch(`/cases/${leadId}/generate-client`, {
            method: "POST",
            token,
            body: JSON.stringify({ type })
        })
            .then((res) => {
                handleRefresh();
                setToast("Client generated successfully!");
            })
            .catch((err) => setError(err.message || "Failed to generate client"))
            .finally(() => setLoading(false));
    };

    const getBanks = (status, productname) => {
        if (status && productname) {
            if (status === "One Pager" || status === "Banker Review") {
                apiFetch(`/banks/products/${productname}`, { method: "GET", token })
                    .then((res) => {
                        console.log(res);
                        if (res && res.banks && Array.isArray(res.banks)) {
                            setBanks(res.banks || []);
                        }
                    })
            }
        }
    };

    const getDocumentConfigs = (caseid) => {
        if (caseid) {
            apiFetch(`/cases/${caseid}/document-config`, { method: "GET", token })
                .then((res) => {
                    if (res && res.configs) {
                        const normalized = {};
                        res.configs.forEach(cfg => {
                            normalized[cfg.bankid] = cfg.document_config || {};
                            setAssignedBankers(prev => [...new Set([...prev, cfg.bankid])]);
                        });
                        setDocConfig(normalized);
                    }
                })
                .catch((err) => setError(err.message || "Failed to fetch document config"));
        }
    };

    useEffect(() => {
        if (showAssignModal) {
            getBanks(lead.status, lead.productname);
            getDocumentConfigs(lead.caseid);
        }
    }, [showAssignModal, lead.status, lead.productname]);

    const closeBankerModal = () => {
        setShowAssignModal(false);
    }

    const saveDocumentsAndClose = () => {
        const payload = Object.entries(docConfig).map(([bankerId, document_config]) => ({
            bankerId,
            documents: document_config
        }));

        apiFetch(`/cases/${lead.caseid}/document-config`, {
            method: "POST",
            token,
            body: JSON.stringify(payload)
        })
            .then((res) => {
                setToast("Documents saved successfully!");
                handleRefresh();
                setShowAssignModal(false);
            })
            .catch((err) => setError(err.message || "Failed to save documents"))
            .finally(() => setLoading(false));
    };

    const isRedFlag = lead.status_updated_on &&
        dayjs().diff(dayjs(lead.status_updated_on), "hour") > 48;

    return (
        <>
            <div className={`lead-card modern ${bgClass}${isRedFlag ? " border-red-flag" : ""}`}
                onClick={e => {
                    if (
                        !e.target.classList.contains("lead-action-btn") &&
                        !e.target.closest(".lead-action-btn") &&
                        !e.target.closest(".edit-icon-btn01")
                    ) {
                        cardClick && cardClick();
                    }
                }}
                style={{ cursor: "pointer", position: "relative" }}>

                {/* Edit Icon - Only for Operations */}
                {(user?.rolename === "Operations" || user?.rolename === "KAM") && (
                    <a
                        className="edit-icon-btn01"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEditModal(true);
                        }}
                        style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            border: "none",
                            borderRadius: "50%",
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "white",
                            fontSize: 14,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            transition: "all 0.2s ease",
                            zIndex: 10
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = "scale(1.1)";
                            e.currentTarget.style.background = "#d97706";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.background = "none";
                        }}
                        title="Edit Lead"
                    >
                        <FaEdit />
                    </a>
                )}

                <div className="lead-card-header">
                    <div className="lead-card-title">
                        <FaBuilding className="lead-card-icon" />
                        <span>{lead.companyname}</span>
                    </div>
                    <div className="lead-card-status">
                        <FaExchangeAlt className="lead-card-icon" />
                        <span>{lead.status === 'Documentation In Progress' ? 'In Progress' : lead.status}</span>
                    </div>
                </div>
                <div className="lead-card-body">
                    <div className="lead-card-row">
                        <FaUser className="lead-card-icon" />
                        <span> {Array.isArray(lead.bank_assignments) && lead.bank_assignments.length > 0 ? (
                            <ul style={{ margin: 0, listStyleType: "none" }}>
                                {lead.bank_assignments.map((ba, idx) => (
                                    <li key={ba.bankid || idx}>
                                        {ba.bank_name} <span style={{ color: "#888" }}>({ba.status})</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span style={{ color: "#888" }}>No bank assigned</span>
                        )}</span>
                    </div>
                    <div className="lead-card-row">
                        <FaMoneyBillWave className="lead-card-icon" />
                        <span><strong>Turnover:</strong> {lead.turnover}</span>
                    </div>
                    <div className="lead-card-row">
                        <FaMoneyBillWave className="lead-card-icon" />
                        <span><strong>Requirement:</strong> {lead.requirement_amount && !isNaN(lead.requirement_amount)
                            ? formatIndianCurrency(lead.requirement_amount)
                            : lead.requirement_amount}</span>
                    </div>
                    <div className="lead-card-row">
                        <FaProductHunt className="lead-card-icon" />
                        <span><strong>Product:</strong> {lead.productname}</span>
                    </div>

                    <div className="lead-card-row">
                        <FaUser className="lead-card-icon" />
                        <span><strong>Telecaller:</strong> {lead?.assignments?.find(ass => ass.assigned_to_role === "Telecaller")?.assigned_to_name || "N/A"}</span>
                    </div>
                    <div className="lead-card-row">
                        <FaUser className="lead-card-icon" />
                        <span><strong>KAM::</strong> {lead?.assignments?.find(ass => ass.assigned_to_role === "KAM")?.assigned_to_name || "N/A"}</span>
                    </div>
                </div>
                <div className="lead-card-footer">
                    <div className="lead-card-actions-row center">
                        {lead?.status === 'Meeting Done' ? (
                            <button
                                className="lead-action-btn"
                                title="Documentation Initiated"
                                onClick={() => updateCaseStatus(lead?.caseid, "Documentation Initiated")}
                            >
                                <FaFileAlt style={{ marginRight: 6 }} /> Initiate Documentation
                            </button>
                        ) : lead?.status !== 'One Pager' ? (
                            <button
                                title="View Details"
                                onClick={() => cardClick()}
                            >
                                <FaFileAlt style={{ marginRight: 6 }} /> View Details
                            </button>
                        ) : (<></>)}
                        {lead?.status.indexOf('Meeting Done', 'Documentation Initiated', 'Documentation In Progress') > 0 ? !lead?.hasSpocAdmin ? (
                            <button
                                className="lead-action-btn"
                                title="Generate Client"
                                onClick={() => generateClient(lead?.caseid, "Settings")}
                            >
                                <GrUserSettings style={{ marginRight: 6 }} />
                            </button>
                        ) : (
                            <button
                                className="lead-action-btn"
                                title="Copy Client Credentials"
                                onClick={e => {
                                    e.stopPropagation();
                                    const creds = `Email: ${lead.clientCredentials?.email || ""}\nPassword: ${lead.clientCredentials?.password || ""}`;
                                    navigator.clipboard.writeText(creds);
                                    setToast("Client credentials copied to clipboard!");
                                }}
                            >
                                <FaCopy style={{ marginRight: 6 }} />
                            </button>
                        ) : (<></>)}
                        {user?.rolename == 'Operations' && ['One Pager', 'Banker Review'].includes(lead?.status) && <button
                            className="lead-action-btn"
                            title="Assign to Banker"
                            onClick={e => {
                                e.stopPropagation();
                                setShowAssignModal(true);
                            }}
                        >
                            <MdAddHome style={{ marginRight: 6 }} />
                        </button>}

                        {['Operations', 'banker'].indexOf(user?.rolename) > -1 && ['One Pager', 'Banker Review'].includes(lead?.status) && <button
                            className="lead-action-btn"
                            title="Add/Update Other Documents"
                            onClick={e => {
                                e.stopPropagation();
                                setShowProvisionalModal(true);
                            }}
                        >
                            <MdNoteAdd style={{ marginRight: 6 }} />
                        </button>}
                        {
                            user?.rolename === 'Operations' && <button
                                className="lead-action-btn-wht"
                                title="Change Lead Status"
                                onClick={e => {
                                    e.stopPropagation();
                                    setEditStatusModal(true);
                                }}
                            >
                                <FaExchangeAlt className="lead-card-icon" /> Change
                            </button>
                        }
                    </div>
                </div>
            </div>
            <AssignBankerModal
                show={showAssignModal}
                onClose={() => saveDocumentsAndClose()}
                closeBankerModal={closeBankerModal}
                banks={banks}
                assignedBankers={assignedBankers}
                setAssignedBankers={setAssignedBankers}
                docConfig={docConfig}
                setDocConfig={setDocConfig}
                caseid={lead.caseid}
            />
            <ProvisionalDocsModal
                show={showProvisionalModal}
                onClose={() => setShowProvisionalModal(false)}
                caseid={lead.caseid}
            />
            <EditLeadModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                lead={lead}
                onSubmit={handleEditSubmit}
                kamUsers={kamUsers}
            />
            <ChangeStatusModal
                show={editStatusModal}
                onClose={() => setEditStatusModal(false)}
                lead={lead}
                onSubmit={updateCaseStatus}
            />
        </>
    );
};

export default ProgressCard;