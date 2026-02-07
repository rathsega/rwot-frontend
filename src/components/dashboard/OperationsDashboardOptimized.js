import React, { useState, useEffect, useCallback } from "react";
import MeetingDone from "./Tabs/MeetingDone";
import DocumentationInitiated from "./Tabs/DocumentationInitiated";
import DocumentationInProgress from "./Tabs/DocumentationInProgress";
import Underwriting from "./Tabs/Underwriting";
import OnePager from "./Tabs/OnePager";
import Pending from "./Tabs/Pending";
import Open from "./Tabs/Open";
import Accept from "./Tabs/Accept";
import Reject from "./Tabs/Reject";
import Pd from "./Tabs/Pd";
import Login from "./Tabs/Login";
import Sanctioned from "./Tabs/Sanctioned";
import Disbursement from "./Tabs/Disbursement";
import Done from "./Tabs/Done";
import Cold from "./Tabs/Cold";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NoRequirement from "./Tabs/NoRequirement";
import { useColdCaseThreshold } from "../../hooks/useSettings";

// Tab configuration with status mappings
const TAB_CONFIG = [
    { key: "Meeting Done", label: "Meeting Done", status: "meeting done" },
    { key: "Documentation In Progress", label: "Doc In Progress", status: "documentation initiated,documentation in progress" },
    { key: "Underwriting", label: "Underwriting", status: "underwriting" },
    { key: "One Pager", label: "One Pager", status: "one pager" },
    { key: "Login", label: "Login", status: "login" },
    { key: "Pd", label: "PD", status: "pd" },
    { key: "Sanctioned", label: "Sanctioned", status: "sanctioned" },
    { key: "Disbursement", label: "Disbursement", status: "disbursement" },
    { key: "Done", label: "Done", status: "done" },
    { key: "Reject", label: "Reject", status: "rejected" },
    { key: "Cold", label: "Cold", status: "cold", isCold: true },
    { key: "No Requirement", label: "No Requirement", status: "no requirement" },
];

export default function OperationsDashboardOptimized() {
    const [activeTab, setActiveTab] = useState("Meeting Done");
    const [counts, setCounts] = useState({});
    const [tabCases, setTabCases] = useState({});
    const [tabLoading, setTabLoading] = useState({});
    const [tabPagination, setTabPagination] = useState({});
    const { token } = useAuth();
    const [countsLoading, setCountsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchDebounce, setSearchDebounce] = useState(null);
    const { coldCaseThresholdHours } = useColdCaseThreshold();

    // Fetch counts on mount (with cold threshold)
    useEffect(() => {
        setCountsLoading(true);
        apiFetch(`/cases/counts?coldThresholdHours=${coldCaseThresholdHours}`, { method: "GET", token })
            .then((res) => {
                setCounts(res.counts || {});
            })
            .catch((err) => setError(err.message || "Failed to fetch counts"))
            .finally(() => setCountsLoading(false));
    }, [token, coldCaseThresholdHours]);

    // Get count for a tab
    const getTabCount = (tabKey) => {
        const config = TAB_CONFIG.find(t => t.key === tabKey);
        if (!config) return 0;
        
        // Special handling for Cold tab
        if (config.isCold) {
            return counts.cold || 0;
        }
        
        // Handle multiple statuses (comma-separated)
        const statuses = config.status.split(',').map(s => s.trim());
        let total = 0;
        for (const status of statuses) {
            const statusKey = Object.keys(counts).find(
                k => k.toLowerCase() === status.toLowerCase()
            );
            if (statusKey) {
                total += counts[statusKey] || 0;
            }
        }
        return total;
    };

    // Fetch cases for a specific tab with pagination and search
    const fetchTabCases = useCallback(async (tabKey, page = 1, append = false, search = "") => {
        const config = TAB_CONFIG.find(t => t.key === tabKey);
        if (!config) return;

        setTabLoading(prev => ({ ...prev, [tabKey]: true }));
        
        try {
            let url = `/cases/list?page=${page}&limit=20`;
            
            // Add status or cold filter
            if (config.isCold) {
                url += `&cold=true&coldThresholdHours=${coldCaseThresholdHours}`;
            } else {
                url += `&status=${encodeURIComponent(config.status)}`;
            }
            
            // Add search if provided
            if (search && search.trim()) {
                url += `&search=${encodeURIComponent(search.trim())}`;
            }
            
            const res = await apiFetch(url, { method: "GET", token });
            
            const newCases = res.cases || [];
            
            setTabCases(prev => ({
                ...prev,
                [tabKey]: append ? [...(prev[tabKey] || []), ...newCases] : newCases
            }));
            
            setTabPagination(prev => ({
                ...prev,
                [tabKey]: res.pagination || { page: 1, totalPages: 1, hasMore: false }
            }));
        } catch (err) {
            toast.error(`Failed to load ${tabKey} cases`);
        } finally {
            setTabLoading(prev => ({ ...prev, [tabKey]: false }));
        }
    }, [token, coldCaseThresholdHours]);

    // Load cases when tab changes
    useEffect(() => {
        // Only fetch if we don't have cases for this tab yet
        if (!tabCases[activeTab] && !tabLoading[activeTab]) {
            fetchTabCases(activeTab, 1, false, searchTerm);
        }
    }, [activeTab, tabCases, tabLoading, fetchTabCases]);

    // Handle search with debounce
    useEffect(() => {
        if (searchDebounce) {
            clearTimeout(searchDebounce);
        }
        
        const timeout = setTimeout(() => {
            // Clear cached data and re-fetch with search
            setTabCases({});
            fetchTabCases(activeTab, 1, false, searchTerm);
        }, 500);
        
        setSearchDebounce(timeout);
        
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // If search is active, fetch with search term
        if (searchTerm && !tabCases[tab]) {
            fetchTabCases(tab, 1, false, searchTerm);
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const handleRefresh = useCallback(() => {
        // Refresh counts
        apiFetch(`/cases/counts?coldThresholdHours=${coldCaseThresholdHours}`, { method: "GET", token })
            .then((res) => setCounts(res.counts || {}))
            .catch(() => {});
        
        // Clear cache and refresh current tab cases
        setTabCases({});
        fetchTabCases(activeTab, 1, false, searchTerm);
    }, [activeTab, fetchTabCases, token, searchTerm, coldCaseThresholdHours]);

    const handleLoadMore = () => {
        const currentPagination = tabPagination[activeTab];
        if (currentPagination?.hasMore) {
            fetchTabCases(activeTab, currentPagination.page + 1, true, searchTerm);
        }
    };

    // Get current tab's cases
    const currentCases = tabCases[activeTab] || [];
    const currentLoading = tabLoading[activeTab];
    const currentPagination = tabPagination[activeTab];

    // Render the appropriate tab component
    const renderTabContent = () => {
        if (currentLoading && currentCases.length === 0) {
            return (
                <div style={{ padding: "48px", textAlign: "center", color: "#888" }}>
                    <div className="loading-spinner" style={{ margin: "0 auto 16px" }}></div>
                    Loading cases...
                </div>
            );
        }

        const tabProps = { 
            cases: currentCases, 
            handleRefresh, 
            searchTerm, 
            onSearchChange: handleSearch 
        };

        switch (activeTab) {
            case "Meeting Done": return <MeetingDone {...tabProps} />;
            case "Documentation In Progress": return <DocumentationInProgress {...tabProps} />;
            case "Underwriting": return <Underwriting {...tabProps} />;
            case "One Pager": return <OnePager {...tabProps} />;
            case "Pending": return <Pending {...tabProps} />;
            case "Open": return <Open {...tabProps} />;
            case "Accept": return <Accept {...tabProps} />;
            case "Reject": return <Reject {...tabProps} />;
            case "Login": return <Login {...tabProps} />;
            case "Pd": return <Pd {...tabProps} />;
            case "Sanctioned": return <Sanctioned {...tabProps} />;
            case "Disbursement": return <Disbursement {...tabProps} />;
            case "Done": return <Done {...tabProps} />;
            case "Cold": return <Cold {...tabProps} />;
            case "No Requirement": return <NoRequirement {...tabProps} />;
            default: return null;
        }
    };

    return (
        <div className="dashboard">
            <div className="tab-navigation">
                {TAB_CONFIG.map(tab => (
                    <button
                        key={tab.key}
                        className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
                        onClick={() => handleTabChange(tab.key)}
                    >
                        {tab.label} ({countsLoading ? "..." : getTabCount(tab.key)})
                    </button>
                ))}
            </div>
            
            <div className="tab-content">
                {renderTabContent()}
                
                {/* Load More Button */}
                {currentPagination?.hasMore && (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <button
                            onClick={handleLoadMore}
                            disabled={currentLoading}
                            style={{
                                padding: "12px 32px",
                                background: currentLoading ? "#ccc" : "#2979ff",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "15px",
                                fontWeight: "600",
                                cursor: currentLoading ? "not-allowed" : "pointer"
                            }}
                        >
                            {currentLoading ? "Loading..." : `Load More (${currentPagination.page}/${currentPagination.totalPages})`}
                        </button>
                    </div>
                )}
            </div>
            
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
            
            <style>{`
                .loading-spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid #e2e8f0;
                    border-top: 3px solid #2979ff;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
