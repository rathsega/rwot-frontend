import React, { useState, useEffect } from 'react';
import { FaFileAlt } from "react-icons/fa";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

function ProvisionalDocsModal({ show, onClose, caseid }) {
    const [docs, setDocs] = useState([]);
    const [newDoc, setNewDoc] = useState("");
    const [loading, setLoading] = useState(false);
    const { token } = useAuth() || {};

    useEffect(() => {
        if (show && caseid) {
            setLoading(true);
            apiFetch(`/cases/${caseid}/provisional-documents`, { method: "GET", token })
                .then(data => setDocs(data?.documents || []))
                .finally(() => setLoading(false));
        }
    }, [show, caseid, token]);

    const addDocument = () => {
        if (!newDoc.trim()) return;
        setLoading(true);
        apiFetch(`/cases/${caseid}/provisional-documents`, {
            method: "POST",
            token,
            body: JSON.stringify({ document_name: newDoc.trim() })
        })
            .then(() => {
                setNewDoc("");
                // Refresh list
                return apiFetch(`/cases/${caseid}/provisional-documents`, { method: "GET", token });
            })
            .then(data => setDocs(data?.documents || []))
            .finally(() => setLoading(false));
    };

    const deleteDocument = (id) => {
        setLoading(true);
        apiFetch(`/cases/${caseid}/provisional-documents/${id}`, {
            method: "DELETE",
            token
        })
            .then(() => {
                setDocs(docs.filter(doc => doc.id !== id));
            })
            .finally(() => setLoading(false));
    };

    if (!show) return null;

    return (
        <div className="lead-details-modal-overlay">
            <div className="lead-details-modal" style={{ minWidth: 340, maxWidth: 400 }}>
                <h3>Other Documents</h3>
                <div style={{ marginBottom: 16 }}>
                    <ul>
                        {docs.map(doc => (
                            <li key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                <span>{doc.document_name}</span>
                                <button
                                    style={{ color: "#e74c3c", border: "none", background: "none", cursor: "pointer" }}
                                    onClick={() => deleteDocument(doc.id)}
                                    disabled={loading}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <input
                        type="text"
                        value={newDoc}
                        onChange={e => setNewDoc(e.target.value)}
                        placeholder="New document name"
                        style={{ flex: 1, padding: 8, borderRadius: 6, border: "1.5px solid #d1d5db" }}
                        disabled={loading}
                    />
                    <button
                        onClick={addDocument}
                        style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#2979ff", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                        disabled={loading || !newDoc.trim()}
                    >
                        Add
                    </button>
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#474141ff", fontWeight: 600, cursor: "pointer" }}>Close</button>
                </div>
            </div>
        </div>
    );
}

export default ProvisionalDocsModal;