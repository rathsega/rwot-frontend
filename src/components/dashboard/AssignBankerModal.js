import React, { useState, useEffect } from 'react';
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

// Document lists
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
const ONE_PAGER_DOC = [
    "OnePager"
];

function AssignBankerModal({ show, closeBankerModal, onClose, banks, assignedBankers, setAssignedBankers, docConfig, setDocConfig, caseid }) {
    

    const [provDocs, setProvDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth() || {};
    const [filteredBanks, setFilteredBanks] = useState(banks);

    useEffect(() => {
        setFilteredBanks(banks);
    }, [banks]);

    const filterBanks = (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = banks.filter(bank =>
            bank.name.toLowerCase().includes(query) || bank.email.toLowerCase().includes(query) || bank.phone.toLowerCase().includes(query)
        );
        setFilteredBanks(filtered);
    };

    // Get provisional docs from provisionalDocs
    useEffect(() => {
        if (show && caseid) {
            setLoading(true);
            apiFetch(`/cases/${caseid}/provisional-documents`, { method: "GET", token })
                .then(data => setProvDocs(data?.documents || []))
                .finally(() => setLoading(false));
        }
    }, [show, caseid, token]);

    //console.log(assignedBankers, docConfig);
    const allDocs = [
        ...PART_A_DOCS.map(d => ({ name: d, type: "partA" })),
        ...PART_B_DOCS.map(d => ({ name: d, type: "partB" })),
        ...ONE_PAGER_DOC.map(d => ({ name: d, type: "onePager" })),
        ...provDocs.map(d => ({ name: d.document_name, type: "provisional" }))
    ];

    const getBankName = (bankerId) => {
        //console.log(banks, bankerId);
        const bank = banks.find(b => b.id == bankerId);
        return bank ? bank.name : bankerId;
    }
    if (!show) return null;
    return (
        <div className="lead-details-modal-overlay">
            <div className="lead-details-modal" style={{ minWidth: 340, maxWidth: 500 }}>
                <h3>Assign to Banker</h3>
                <div style={{ marginBottom: 18 }}>
                    <label style={{ fontWeight: 600 }}>Select Bankers</label>
                    {/* Need search option by bank name, email, phone */}
                    <input type="text" placeholder="Search by name, email, phone" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1.5px solid #d1d5db", marginTop: 6, fontSize: 15 }} onChange={filterBanks} />
                    <select
                        multiple
                        value={assignedBankers}
                        onChange={e => {
                            const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                            setAssignedBankers(options);
                        }}
                        style={{
                            width: "100%",
                            padding: 8,
                            borderRadius: 6,
                            border: "1.5px solid #d1d5db",
                            marginTop: 6,
                            fontSize: 15,
                            background: "#fff",
                            minHeight: 80
                        }}
                    >
                        {filteredBanks?.map((bank, idx) => (
                            <option key={bank.id || idx} value={bank.id}>
                                {bank.name} - {bank.email}
                            </option>
                        ))}
                    </select>
                </div>
                {assignedBankers.map(bankerId => {
                    return (
                        <div key={bankerId} style={{ marginBottom: 18, border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span>
                                    Documents for <span style={{ color: "#2979ff" }}>{getBankName(bankerId)}</span>
                                </span>
                                <button
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#e74c3c",
                                        cursor: "pointer",
                                        fontSize: "1.2em",
                                        marginLeft: 8
                                    }}
                                    title="Remove Banker"
                                    onClick={() => {
                                        setAssignedBankers(assignedBankers.filter(id => id !== bankerId));
                                        // Optionally remove docConfig for this banker
                                        const newDocConfig = { ...docConfig };
                                        delete newDocConfig[bankerId];
                                        setDocConfig(newDocConfig);
                                    }}
                                >
                                    &#10006;
                                </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {allDocs.map((doc, idx) => (
                                    <label key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <input
                                            type="checkbox"
                                            checked={docConfig[bankerId]?.[`${doc.type}_${doc.name}`] || false}
                                            onChange={e => {
                                                setDocConfig({
                                                    ...docConfig,
                                                    [bankerId]: {
                                                        ...(docConfig[bankerId] || {}),
                                                        [`${doc.type}_${doc.name}`]: e.target.checked
                                                    }
                                                });
                                            }}
                                        />
                                        <span>{doc.name} <span style={{ fontSize: 12, color: "#888" }}>({doc.type})</span></span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    {/* Need cancel button */}
                    <button onClick={closeBankerModal} style={{ padding: "8px 16px", borderRadius: 6, border: "1.5px solid #d1d5db", background: "gray", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#7840efff", fontWeight: 600, cursor: "pointer" }}>Save</button>
                </div>
            </div>
        </div>
    );
};
export default AssignBankerModal;