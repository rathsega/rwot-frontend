import React, { useState, useEffect, useMemo } from "react";
import CaseTabs from "../common/CaseTabs";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./UnifiedDashboard.css";

/**
 * UnifiedDashboard - A refactored dashboard component that uses CaseTabs
 * This component can be used as a template for all role-based dashboards
 */
export default function UnifiedDashboard() {
    const [activeTab, setActiveTab] = useState("open");
    const [cases, setCases] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { token, user } = useAuth();
    
    const pageSize = 20;

    // Define tabs based on user role
    const getTabs = () => {
        const baseTabs = [
            { key: "open", label: "Open", statuses: ["Open"] },
            { key: "meeting-done", label: "Meeting Done", statuses: ["Meeting Done"] },
            { key: "documentation", label: "Documentation", statuses: ["Documentation Initiated", "Documentation In Progress"] },
            { key: "underwriting", label: "Underwriting", statuses: ["Underwriting", "One Pager"] },
            { key: "banker-review", label: "Banker Review", statuses: ["Banker Review"] },
            { key: "no-requirement", label: "No Requirement", statuses: ["No Requirement"] },
        ];

        // Admin/Operations see all tabs
        if (user?.rolename === "Admin" || user?.rolename === "Operations") {
            return baseTabs;
        }

        // KAM sees leads, progress, no requirement
        if (user?.rolename === "KAM") {
            return [
                { key: "open", label: "Leads", statuses: ["Open"] },
                { key: "progress", label: "Progress", statuses: ["Meeting Done", "Documentation Initiated", "Documentation In Progress", "Underwriting", "One Pager", "Banker Review"] },
                { key: "no-requirement", label: "No Requirement", statuses: ["No Requirement"] },
            ];
        }

        // Telecaller sees open and closed
        if (user?.rolename === "Telecaller") {
            return [
                { key: "open", label: "Open", statuses: ["Open"] },
                { key: "closed", label: "Closed", statuses: ["No Requirement", "Disbursed", "Closed"] },
            ];
        }

        return baseTabs;
    };

    const tabs = getTabs();

    // Fetch cases and counts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const [casesRes, countsRes] = await Promise.all([
                    apiFetch("/cases", { method: "GET", token }),
                    apiFetch("/cases/counts", { method: "GET", token })
                ]);

                const casesArr = Array.isArray(casesRes) ? casesRes : casesRes.cases || [];
                setCases(casesArr);
                setStatusCounts(countsRes.counts || {});
            } catch (err) {
                setError(err.message || "Failed to fetch data");
                toast.error("Failed to load cases");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const [casesRes, countsRes] = await Promise.all([
                apiFetch("/cases", { method: "GET", token }),
                apiFetch("/cases/counts", { method: "GET", token })
            ]);

            const casesArr = Array.isArray(casesRes) ? casesRes : casesRes.cases || [];
            setCases(casesArr);
            setStatusCounts(countsRes.counts || {});
        } catch (err) {
            toast.error("Failed to refresh");
        } finally {
            setLoading(false);
        }
    };

    // Get cases for current tab
    const currentTab = tabs.find(t => t.key === activeTab) || tabs[0];
    const filteredCases = useMemo(() => {
        return cases.filter(c => 
            currentTab.statuses.map(s => s.toLowerCase()).includes((c.status || "").toLowerCase())
        );
    }, [cases, currentTab]);

    // Get count for a tab
    const getTabCount = (tab) => {
        return tab.statuses.reduce((sum, status) => {
            return sum + (statusCounts[status] || 0);
        }, 0);
    };

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        setPage(1); // Reset page when changing tabs
    };

    return (
        <div className="unified-dashboard">
            <ToastContainer position="bottom-right" autoClose={3000} />
            
            {/* Tab Navigation with Counts */}
            <div className="dashboard-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`dashboard-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.key)}
                    >
                        {tab.label}
                        <span className="tab-count">{getTabCount(tab)}</span>
                    </button>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <div className="dashboard-error">
                    <p>{error}</p>
                    <button onClick={handleRefresh}>Retry</button>
                </div>
            )}

            {/* Cases List */}
            <div className="dashboard-content">
                <CaseTabs
                    cases={filteredCases}
                    handleRefresh={handleRefresh}
                    status={currentTab.label}
                    totalCount={filteredCases.length}
                    page={page}
                    setPage={setPage}
                    pageSize={pageSize}
                    loading={loading}
                    emptyMessage={`No ${currentTab.label.toLowerCase()} cases found`}
                />
            </div>
        </div>
    );
}
