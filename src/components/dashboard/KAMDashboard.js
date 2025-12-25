import React, { useState, useEffect } from "react";
import LeadsTab from "./LeadsTab";
import ProgressTab from "./ProgressTab";
import NoRequirementTab from "./Tabs/NoRequirement";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function KAMDashboard() {
    const [activeTab, setActiveTab] = useState("leads");
    const [cases, setCases] = useState([]);
    const [leads, setLeads] = useState([]);
    const [progress, setProgress] = useState([]);
    const [noRequirement, setNoRequirement] = useState([]);
    const [leadFilter, setLeadFilter] = useState("today"); // "today", "tomorrow", "dayAfterTomorrow", "rest"
    const [statusFilter, setStatusFilter] = useState(""); // for progress tab filtering
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
                
                const openLeads = arr.filter(lead => lead.status?.toLowerCase() === "open");
                setLeads(openLeads);
                
                let data = arr.filter(item => item.status?.toLowerCase() !== "open" && item.status?.toLowerCase() !== "no requirement");
                console.log(data);
                setProgress(data);

                const noReq = arr.filter(item => item.status?.toLowerCase() === "no requirement");
                console.log(noReq);
                setNoRequirement(noReq);
            })
            .catch((err) => setError(err.message || "Failed to fetch cases"))
            .finally(() => setLoading(false));
    }, [token, refreshToken]);

    const handleRefresh = () => {
        setRefreshToken(prev => !prev);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Reset filters when switching tabs
        if (tab === "leads") {
            setStatusFilter("");
        } else {
            setLeadFilter("today");
        }
    };

    const filterLeadsByDate = (leads, filter) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        
        const dayAfterDayAfterTomorrow = new Date(today);
        dayAfterDayAfterTomorrow.setDate(dayAfterDayAfterTomorrow.getDate() + 3);
        
        return leads.filter(lead => {
            const leadDate = new Date(lead.date);
            leadDate.setHours(0, 0, 0, 0);
            
            if (filter === "today") {
                return leadDate.getTime() === today.getTime();
            } else if (filter === "tomorrow") {
                return leadDate.getTime() === tomorrow.getTime();
            } else if (filter === "dayAfterTomorrow") {
                return leadDate.getTime() === dayAfterTomorrow.getTime();
            } else if (filter === "rest") {
                return leadDate.getTime() !== today.getTime() &&
                       leadDate.getTime() !== tomorrow.getTime() &&
                       leadDate.getTime() !== dayAfterTomorrow.getTime();
            }
            return false;
        });
    };

    // Get lead counts for each category
    const getLeadCounts = (leads) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        
        const dayAfterDayAfterTomorrow = new Date(today);
        dayAfterDayAfterTomorrow.setDate(dayAfterDayAfterTomorrow.getDate() + 3);
        
        const counts = {
            today: 0,
            tomorrow: 0,
            dayAfterTomorrow: 0,
            rest: 0
        };
        
        leads.forEach(lead => {
            const leadDate = new Date(lead.date);
            leadDate.setHours(0, 0, 0, 0);
            
            if (leadDate.getTime() === today.getTime()) {
                counts.today++;
            } else if (leadDate.getTime() === tomorrow.getTime()) {
                counts.tomorrow++;
            } else if (leadDate.getTime() === dayAfterTomorrow.getTime()) {
                counts.dayAfterTomorrow++;
            } else if (leadDate.getTime() !== today.getTime() &&
                       leadDate.getTime() !== tomorrow.getTime() &&
                       leadDate.getTime() !== dayAfterTomorrow.getTime()) {
                counts.rest++;
            }
        });
        
        return counts;
    };

    // Format date for display
    const formatDate = (daysOffset) => {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    // Get unique statuses with counts from progress data
    const getStatusCounts = (progressData) => {
        const statusCounts = {};
        progressData.forEach(item => {
            const status = item.status || "Unknown";
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        return statusCounts;
    };

    const filteredLeads = filterLeadsByDate(leads, leadFilter);
    const leadCounts = getLeadCounts(leads);
    const statusCounts = getStatusCounts(progress);
    
    // Filter progress by status
    const filteredProgress = statusFilter 
        ? progress.filter(item => item.status === statusFilter)
        : progress;

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
                <button className={`tab-button ${activeTab === "noRequirement" ? "active" : ""}`} 
                    onClick={() => handleTabChange("noRequirement")}>
                    No Requirement
                </button>
            </div>

            {/* Filters */}
            <div style={{
                display: "flex",
                justifyContent: "center",
                margin: "20px 0",
                gap: "20px",
                alignItems: "center"
            }}>
                {/* Lead Filter Toggle - Only show when Leads tab is active */}
                {activeTab === "leads" && (
                    <div style={{
                        display: "flex",
                        background: "#f1f3f4",
                        borderRadius: "25px",
                        padding: "4px",
                        gap: "4px"
                    }}>
                        <button
                            onClick={() => setLeadFilter("today")}
                            style={{
                                padding: "8px 16px",
                                border: "none",
                                borderRadius: "20px",
                                background: leadFilter === "today" ? "#1d4ed8" : "transparent",
                                color: leadFilter === "today" ? "#fff" : "#666",
                                fontWeight: "600",
                                fontSize: "13px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                whiteSpace: "nowrap"
                            }}
                        >
                            Today ({formatDate(0)}) - {leadCounts.today}
                        </button>
                        <button
                            onClick={() => setLeadFilter("tomorrow")}
                            style={{
                                padding: "8px 16px",
                                border: "none",
                                borderRadius: "20px",
                                background: leadFilter === "tomorrow" ? "#1d4ed8" : "transparent",
                                color: leadFilter === "tomorrow" ? "#fff" : "#666",
                                fontWeight: "600",
                                fontSize: "13px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                whiteSpace: "nowrap"
                            }}
                        >
                            Tomorrow ({formatDate(1)}) - {leadCounts.tomorrow}
                        </button>
                        <button
                            onClick={() => setLeadFilter("dayAfterTomorrow")}
                            style={{
                                padding: "8px 16px",
                                border: "none",
                                borderRadius: "20px",
                                background: leadFilter === "dayAfterTomorrow" ? "#1d4ed8" : "transparent",
                                color: leadFilter === "dayAfterTomorrow" ? "#fff" : "#666",
                                fontWeight: "600",
                                fontSize: "13px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                whiteSpace: "nowrap"
                            }}
                        >
                            Day After ({formatDate(2)}) - {leadCounts.dayAfterTomorrow}
                        </button>
                        <button
                            onClick={() => setLeadFilter("rest")}
                            style={{
                                padding: "8px 16px",
                                border: "none",
                                borderRadius: "20px",
                                background: leadFilter === "rest" ? "#1d4ed8" : "transparent",
                                color: leadFilter === "rest" ? "#fff" : "#666",
                                fontWeight: "600",
                                fontSize: "13px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                whiteSpace: "nowrap"
                            }}
                        >
                            Rest Leads - {leadCounts.rest}
                        </button>
                    </div>
                )}

                {/* Status Filter Dropdown - Only show when Progress tab is active */}
                {activeTab === "progress" && (
                    <div style={{ minWidth: "250px" }}>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                padding: "10px 15px",
                                border: "2px solid #e2e8f0",
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: "500",
                                background: "#fff",
                                cursor: "pointer",
                                width: "100%",
                                outline: "none",
                                transition: "border-color 0.2s ease"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#1d4ed8"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        >
                            <option value="">All Statuses ({progress.length})</option>
                            {Object.entries(statusCounts)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([status, count]) => (
                                    <option key={status} value={status}>
                                        {status} ({count})
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                )}
            </div>
            
            <div className="tab-content">
                {activeTab === "leads" ? (
                    <LeadsTab 
                        leads={filteredLeads} 
                        handleRefresh={handleRefresh} 
                        filterType={leadFilter}
                    />
                ) : activeTab === "progress" ? (
                    <ProgressTab 
                        progress={filteredProgress} 
                        handleRefresh={handleRefresh} 
                        statusFilter={statusFilter}
                    />
                ) : activeTab === "noRequirement" ? (
                    <NoRequirementTab 
                        cases={noRequirement} 
                        handleRefresh={handleRefresh} 
                    />
                ) : null}
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
        </div>
    );
}