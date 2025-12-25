import React, { useState, useEffect } from "react";
import LeadsTab from "./LeadsTab";
import ProgressTab from "./ProgressTab";
// import "./Dashboard.css";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("leads");
    const [cases, setCases] = useState([]);
    const [leads, setLeads] = useState([]);
    const [progress, setProgress] = useState([]);
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshToken, setRefreshToken] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError("");
        apiFetch("/cases", {
            method: "GET",
            token
        })
            .then((res) => {
                const arr = Array.isArray(res) ? res : res.cases || [];
                setCases(arr);
                setLeads(arr.filter(lead => lead.status?.toLowerCase() === "open"));
                let data = arr.filter(item => item.status?.toLowerCase() !== "open");
                console.log(data);
                setProgress(data);
            })
            .catch((err) => setError(err.message || "Failed to fetch cases"))
            .finally(() => setLoading(false));
    }, [token, refreshToken]);

    const handleRefresh = () => {
        setRefreshToken(prev => !prev);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="dashboard">
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === "leads" ? "active" : ""}`}
                    onClick={() => handleTabChange("leads")}
                >
                    Leads
                </button>
                <button
                    className={`tab-button ${activeTab === "progress" ? "active" : ""}`}
                    onClick={() => handleTabChange("progress")}
                >
                    Progress
                </button>
            </div>
            <div className="tab-content">
                {activeTab === "leads" ? <LeadsTab leads={leads} handleRefresh={handleRefresh} /> : <ProgressTab progress={progress} handleRefresh={handleRefresh} />}
            </div>
        </div>
    );
}