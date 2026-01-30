import React, { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaExchangeAlt, FaHandshake, FaEdit, FaTimes, FaBan } from 'react-icons/fa';
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import { isArray } from 'tsparticles-engine';

// Edit Lead Modal - matching TeleCallersDashboard style
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
        new_comments: ""
    });

    const required = ["companyname", "clientname", "phonenumber", "date", "time"];
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (lead) {
            // Check if turnover matches predefined ranges
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
                comments: Array.isArray(lead.comments) && lead.comments.length > 0 ? lead.comments[lead.comments.length - 1].text : "",
                assignedKam: lead.assignedKam || "",
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
        if(form?.new_comments.trim().length <= 0){
            setFormError("Comments cannot be empty.");
            return;
        }
        if (form.phonenumber && !/^\d{10}$/.test(form.phonenumber.trim())) {
            setFormError("Phone number must be 10 digits.");
            return;
        }

        const finalTurnover = form.turnoverType === "Others" ? form.turnover : form.turnoverType;
        onSubmit({ ...form, turnover: finalTurnover,  comments: form["new_comments"] });
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
                            ) : (
                                <input
                                    type={key === "date" ? "date" : "text"}
                                    value={form[key] || ""}
                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    style={styles.input}
                                />
                            )}
                        </div>
                    ))}

                    {/* Assign KAM dropdown */}
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

// Modal for multiple products/amounts with description
function ProductRequirementModal({ show, onClose, onSubmit, existingProducts, productsList }) {
    const [products, setProducts] = useState([{ product: "", amount: "" }]);
    const [description, setDescription] = useState("");

    // Initialize with existing products if available
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

    const handleAddProduct = () => {
        setProducts([...products, { product: "", amount: "" }]);
    };

    const handleRemoveProduct = (index) => {
        if (products.length > 1) {
            setProducts(products.filter((_, i) => i !== index));
        }
    };

    const handleProductChange = (index, field, value) => {
        const updated = [...products];
        updated[index][field] = value;
        setProducts(updated);
    };

    const isValid = products.every(p => p.product && p.amount) && products.length > 0;

    if (!show) return null;

    return (
        <div className="lead-details-modal-overlay">
            <div className="lead-details-modal" style={{ minWidth: 420, maxWidth: 550, maxHeight: "85vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ margin: 0 }}>Update Products & Requirements</h3>
                    <button 
                        onClick={onClose} 
                        style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#555" }}
                    >
                        <FaTimes />
                    </button>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <label style={{ fontWeight: 600, fontSize: 15 }}>Products & Amounts</label>
                        <button
                            type="button"
                            onClick={handleAddProduct}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "none",
                                background: "#10b981",
                                color: "#fff",
                                fontWeight: 600,
                                cursor: "pointer",
                                fontSize: 13
                            }}
                        >
                            + Add Product
                        </button>
                    </div>
                    
                    {products.map((item, index) => (
                        <div 
                            key={index} 
                            style={{ 
                                display: "flex", 
                                gap: 10, 
                                marginBottom: 12, 
                                padding: 12, 
                                background: "#f8fafc", 
                                borderRadius: 8,
                                border: "1px solid #e2e8f0"
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <label style={{ fontWeight: 500, fontSize: 13, color: "#64748b" }}>Product</label>
                                <select
                                    value={item.product}
                                    onChange={e => handleProductChange(index, "product", e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: 8,
                                        borderRadius: 6,
                                        border: "1.5px solid #d1d5db",
                                        marginTop: 4,
                                        fontSize: 14,
                                        background: "#fff"
                                    }}
                                >
                                    <option value="">Select product</option>
                                    {productsList?.map((p, idx) => (
                                        <option key={idx} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontWeight: 500, fontSize: 13, color: "#64748b" }}>Amount</label>
                                <input
                                    type="number"
                                    value={item.amount}
                                    onChange={e => handleProductChange(index, "amount", e.target.value)}
                                    style={{ 
                                        width: "100%", 
                                        padding: 8, 
                                        borderRadius: 6, 
                                        border: "1.5px solid #d1d5db", 
                                        marginTop: 4,
                                        fontSize: 14
                                    }}
                                    placeholder="Enter amount"
                                />
                            </div>
                            {products.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveProduct(index)}
                                    style={{
                                        alignSelf: "flex-end",
                                        padding: "8px 10px",
                                        borderRadius: 6,
                                        border: "none",
                                        background: "#ef4444",
                                        color: "#fff",
                                        cursor: "pointer",
                                        marginBottom: 2
                                    }}
                                    title="Remove"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ fontWeight: 600, fontSize: 15 }}>Requirement Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 6,
                            border: "1.5px solid #d1d5db",
                            marginTop: 6,
                            fontSize: 14,
                            minHeight: 100,
                            resize: "vertical",
                            fontFamily: "inherit"
                        }}
                        placeholder="Enter detailed description about the requirement..."
                    />
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    <button 
                        onClick={onClose} 
                        style={{ padding: "10px 20px", borderRadius: 6, border: "none", background: "#6f6767ff", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(products, description)}
                        style={{ padding: "10px 20px", borderRadius: 6, border: "none", background: "#2979ff", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                        disabled={!isValid}
                    >
                        Save & Update
                    </button>
                </div>
            </div>
        </div>
    );
}

const LeadCard = ({ lead, bgClass, cardClick, handleRefresh, productsList, kamUsers, coldCaseThresholdHours = 48 }) => {
    console.log("Products List in LeadCard:", productsList);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { token, user } = useAuth() || {};

    // Fetch KAM users
    

    // Check if user is KAM or Operations
    const canEdit = user?.rolename === "KAM" || user?.rolename === "Operations";

    const updateCaseStatus = (leadId, status, products, description) => {
        setLoading(true);
        setMessage("");
        apiFetch(`/cases/${leadId}/status`, {
            method: "PATCH",
            token,
            body: JSON.stringify({ status, products, description })
        })
            .then((res) => {
                handleRefresh && handleRefresh();
                setMessage("Case status updated successfully!");
            })
            .catch((err) => setMessage(err.message || "Failed to update case status"))
            .finally(() => setLoading(false));
    };

    const handleEditSubmit = (updatedData) => {
        setLoading(true);
        setMessage("");
        if (updatedData?.comments) {
            updatedData.comments = Array.isArray(updatedData.comments)
                ? updatedData.comments
                : [updatedData.comments];
        }

        if(updatedData?.new_comments){
            updatedData.comments = updatedData.new_comments;
            delete updatedData.new_comments;
        }
        
        apiFetch(`/cases/edit/${lead.caseid}`, {
            method: "PUT",
            token,
            body: JSON.stringify(updatedData)
        })
            .then((res) => {
                handleRefresh && handleRefresh();
                setMessage("Lead updated successfully!");
                setShowEditModal(false);
            })
            .catch((err) => setMessage(err.message || "Failed to update lead"))
            .finally(() => setLoading(false));
    };

    const isRedFlag = lead.status !== "Open" && lead.status_updated_on &&
        dayjs().diff(dayjs(lead.status_updated_on), "hour") > coldCaseThresholdHours;

    return (
        <>
            <div className={`lead-card modern ${bgClass}${isRedFlag ? " border-red-flag" : ""}`}
                onClick={e => {
                    if (
                        !e.target.classList.contains("lead-action-btn") &&
                        !e.target.closest(".lead-action-btn")
                    ) {
                        cardClick && cardClick();
                    }
                }}
                style={{ cursor: "pointer" }}>
                <div className="lead-card-header">
                    <div className="lead-card-title">
                        <FaBuilding className="lead-card-icon" />
                        <span>{lead.companyname}</span>
                    </div>
                    <div className="lead-card-status">
                        <FaExchangeAlt className="lead-card-icon" />
                        <span>{lead.status}</span>
                    </div>
                </div>
                <div className="lead-card-body">
                    <div className="lead-card-row">
                        <FaUser className="lead-card-icon" />
                        <span><strong>POC:</strong> {lead.clientname}</span>
                    </div>
                    <div className="lead-card-row">
                        <FaMoneyBillWave className="lead-card-icon" />
                        <span><strong>Turnover:</strong> {lead.turnover}</span>
                    </div>
                    <div className="lead-card-row">
                        <FaMapMarkerAlt className="lead-card-icon" />
                        <span>
                            <strong>Location:</strong>{' '}
                            {/^https?:\/\//i.test(lead.location)
                                ? <a href={lead.location} target="_blank" rel="noopener noreferrer">View</a>
                                : lead.location}
                        </span>
                    </div>
                    <div className="lead-card-row">
                        <FaUser className="lead-card-icon" />
                        <span><strong>Telecaller:</strong> {lead?.assignments?.find(ass => ass.assigned_to_role === "Telecaller")?.assigned_to_name || "N/A"}</span>
                    </div>
                    <div className="lead-card-row">
                        <FaUser className="lead-card-icon" />
                        <span><strong>Assigned KAM:</strong> {lead?.assignments?.find(ass => ass.assigned_to_role === "KAM")?.assigned_to_name || "N/A"}</span>
                    </div>
                </div>
                <div className="lead-card-footer">
                    <div className="lead-card-actions-row center">
                        <button
                            className="lead-action-btn"
                            title="Meeting Done"
                            onClick={e => {
                                e.stopPropagation();
                                setShowModal(true);
                            }}
                            disabled={loading}
                        >
                            <FaHandshake style={{ marginRight: 6 }} /> Meeting Done
                        </button>
                        <button
                            className="lead-action-btn"
                            title="No Requirement"
                            onClick={e => {
                                e.stopPropagation();
                                updateCaseStatus(lead?.caseid, "No Requirement", [], "");
                            }}
                            disabled={loading}
                        >
                            <FaBan style={{ marginRight: 6 }} /> No Requirement
                        </button>
                        {canEdit && (
                            <button
                                className="lead-action-btn"
                                title="Edit Lead"
                                onClick={e => {
                                    e.stopPropagation();
                                    setShowEditModal(true);
                                }}
                                disabled={loading}
                                style={{ background: "#f59e0b", color: "white" }}
                            >
                                <FaEdit style={{ marginRight: 6 }} /> Edit
                            </button>
                        )}
                    </div>
                    {message && <div className="status-message">{message}</div>}
                </div>
            </div>
            <ProductRequirementModal
                show={showModal}
                onClose={() => setShowModal(false)}
                existingProducts={lead.product_requirements || []}
                productsList={productsList}
                onSubmit={(products, description) => {
                    setShowModal(false);
                    updateCaseStatus(lead?.caseid, "Meeting Done", products, description);
                }}
            />
            <EditLeadModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                lead={lead}
                onSubmit={handleEditSubmit}
                kamUsers={kamUsers}
            />
        </>
    );
};

export default LeadCard;