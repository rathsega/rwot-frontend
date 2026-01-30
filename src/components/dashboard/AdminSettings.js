import React, { useState, useEffect } from "react";
import { FaCog, FaSave, FaSpinner } from "react-icons/fa";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminSettings() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        cold_case_threshold_hours: "48"
    });

    useEffect(() => {
        fetchSettings();
    }, [token]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await apiFetch("/settings", {
                method: "GET",
                token
            });
            if (res?.settings) {
                setSettings({
                    cold_case_threshold_hours: res.settings.cold_case_threshold_hours || "48"
                });
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key, value, description) => {
        setSaving(true);
        try {
            await apiFetch("/settings", {
                method: "POST",
                token,
                body: JSON.stringify({ key, value, description })
            });
            toast.success("Setting saved successfully!");
            fetchSettings();
        } catch (err) {
            console.error("Failed to save setting:", err);
            toast.error("Failed to save setting");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <FaSpinner className="spin" size={24} />
                    <span>Loading settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <FaCog size={24} style={{ color: "#3b82f6" }} />
                <h2 style={styles.title}>Admin Settings</h2>
            </div>

            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Case Management</h3>
                
                <div style={styles.settingRow}>
                    <div style={styles.settingInfo}>
                        <label style={styles.label}>Cold Case Threshold (Hours)</label>
                        <p style={styles.description}>
                            Number of hours after which a case becomes "cold" if the status is not updated.
                            Cases marked as cold will appear in the Cold tab on dashboards.
                        </p>
                    </div>
                    <div style={styles.settingInput}>
                        <input
                            type="number"
                            min="1"
                            max="720"
                            value={settings.cold_case_threshold_hours}
                            onChange={(e) => handleChange("cold_case_threshold_hours", e.target.value)}
                            style={styles.input}
                        />
                        <span style={styles.unit}>hours</span>
                        <button
                            onClick={() => handleSave(
                                "cold_case_threshold_hours",
                                settings.cold_case_threshold_hours,
                                "Number of hours after which a case becomes cold if status is not updated"
                            )}
                            disabled={saving}
                            style={styles.saveBtn}
                        >
                            {saving ? <FaSpinner className="spin" /> : <FaSave />}
                            Save
                        </button>
                    </div>
                </div>
            </div>

            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
        </div>
    );
}

const styles = {
    container: {
        padding: "24px",
        maxWidth: "900px",
        margin: "0 auto"
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "24px"
    },
    title: {
        margin: 0,
        fontSize: "24px",
        fontWeight: 600,
        color: "#1e293b"
    },
    loading: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "48px",
        color: "#64748b"
    },
    card: {
        background: "#fff",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #e2e8f0"
    },
    cardTitle: {
        margin: "0 0 20px 0",
        fontSize: "18px",
        fontWeight: 600,
        color: "#334155",
        paddingBottom: "12px",
        borderBottom: "1px solid #e2e8f0"
    },
    settingRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "24px",
        padding: "16px 0"
    },
    settingInfo: {
        flex: 1
    },
    label: {
        display: "block",
        fontSize: "15px",
        fontWeight: 600,
        color: "#1e293b",
        marginBottom: "6px"
    },
    description: {
        margin: 0,
        fontSize: "13px",
        color: "#64748b",
        lineHeight: 1.5
    },
    settingInput: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    input: {
        width: "80px",
        padding: "10px 12px",
        fontSize: "15px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        textAlign: "center",
        outline: "none"
    },
    unit: {
        fontSize: "14px",
        color: "#64748b"
    },
    saveBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#fff",
        background: "#3b82f6",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background 0.2s"
    }
};
