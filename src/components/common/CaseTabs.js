import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CaseCard from "../common/CaseCard";
import { useAuth } from "../../context/AuthContext";
import apiFetch from "../../utils/api";
import { exportLeadsToExcel } from "../../services/leadExportService";
import { FaSearch, FaFileExport, FaChevronLeft, FaChevronRight, FaHandshake, FaBan, FaEye, FaExchangeAlt } from "react-icons/fa";
import "./CaseTabs.css";

/**
 * Unified CaseTabs component for all dashboard tabs
 * @param {Object} props
 * @param {Array} props.cases - Array of cases to display
 * @param {Function} props.handleRefresh - Refresh callback
 * @param {string} props.status - Current status filter
 * @param {number} props.totalCount - Total count from backend (for pagination)
 * @param {number} props.page - Current page number
 * @param {Function} props.setPage - Function to change page
 * @param {number} props.pageSize - Items per page
 * @param {boolean} props.loading - Loading state
 * @param {string} props.emptyMessage - Custom message when no cases
 */
const CaseTabs = ({
    cases = [],
    handleRefresh,
    status = "",
    totalCount = 0,
    page = 1,
    setPage,
    pageSize = 20,
    loading = false,
    emptyMessage = "No records found"
}) => {
    const navigate = useNavigate();
    const { token, user } = useAuth() || {};
    const [search, setSearch] = useState("");
    const [kamUsers, setKamUsers] = useState([]);
    const [productsList, setProductsList] = useState([]);
    const [statusModal, setStatusModal] = useState({ show: false, caseId: null, newStatus: "" });

    useEffect(() => {
        fetchKamUsers();
        fetchProductsList();
    }, [token]);

    const fetchKamUsers = async () => {
        try {
            const res = await apiFetch("/users/getKamAndTelecallers", { method: "GET", token });
            const users = res.users || res || [];
            setKamUsers(users.filter(u => u.rolename === "KAM"));
        } catch (err) {
            console.error("Failed to fetch KAM users:", err);
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

    // Filter cases by search
    const filteredCases = useMemo(() => {
        if (!search.trim()) return cases;
        const lowerSearch = search.trim().toLowerCase();
        return cases.filter(c =>
            (c.companyname || "").toLowerCase().includes(lowerSearch) ||
            (c.clientname || "").toLowerCase().includes(lowerSearch) ||
            (c.phonenumber || "").includes(lowerSearch) ||
            (c.status || "").toLowerCase().includes(lowerSearch)
        );
    }, [cases, search]);

    // Pagination calculations
    const totalPages = Math.ceil((totalCount || filteredCases.length) / pageSize);
    const displayedCases = setPage ? filteredCases : filteredCases.slice((page - 1) * pageSize, page * pageSize);

    const handleExport = () => {
        exportLeadsToExcel(cases, `${status || 'cases'}_export.xlsx`);
    };

    const handleCardClick = (caseItem) => {
        navigate(`/dashboard/case/${caseItem.caseid}`);
    };

    const handleStatusChange = async (caseId, newStatus, products = null, description = "") => {
        try {
            await apiFetch(`/cases/${caseId}/status`, {
                method: "PATCH",
                token,
                body: JSON.stringify({ status: newStatus, products, description })
            });
            handleRefresh?.();
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const getActionsForCase = (caseItem) => {
        const actions = [];
        const currentStatus = caseItem.status;

        // View action always available
        actions.push({
            label: "View",
            icon: FaEye,
            color: "#3b82f6",
            onClick: (e) => {
                e.stopPropagation();
                handleCardClick(caseItem);
            }
        });

        // Status-specific actions
        if (currentStatus === "Open") {
            actions.push({
                label: "Meeting Done",
                icon: FaHandshake,
                color: "#10b981",
                onClick: (e) => {
                    e.stopPropagation();
                    handleCardClick(caseItem); // Navigate to page for product selection
                }
            });
            actions.push({
                label: "No Requirement",
                icon: FaBan,
                color: "#ef4444",
                onClick: (e) => {
                    e.stopPropagation();
                    handleStatusChange(caseItem.caseid, "No Requirement");
                }
            });
        }

        return actions;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage ? setPage(newPage) : null;
        }
    };

    return (
        <div className="case-tabs-container">
            {/* Search & Export Bar */}
            <div className="case-tabs-toolbar">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search cases..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="toolbar-actions">
                    <span className="case-count">
                        {totalCount || filteredCases.length} case{(totalCount || filteredCases.length) !== 1 ? 's' : ''}
                    </span>
                    <button className="btn-export" onClick={handleExport}>
                        <FaFileExport /> Export
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="case-tabs-loading">
                    <div className="spinner"></div>
                    <p>Loading cases...</p>
                </div>
            )}

            {/* Cases Grid */}
            {!loading && (
                <>
                    {displayedCases.length === 0 ? (
                        <div className="case-tabs-empty">
                            <span className="empty-icon">📄</span>
                            <p>{emptyMessage}</p>
                        </div>
                    ) : (
                        <div className="case-tabs-grid">
                            {displayedCases.map((caseItem) => (
                                <CaseCard
                                    key={caseItem.caseid || caseItem.id}
                                    caseData={caseItem}
                                    onClick={() => handleCardClick(caseItem)}
                                    actions={getActionsForCase(caseItem)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="case-tabs-pagination">
                            <button
                                className="page-btn"
                                disabled={page <= 1}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                <FaChevronLeft /> Prev
                            </button>
                            
                            <div className="page-numbers">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`page-num ${page === pageNum ? 'active' : ''}`}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                className="page-btn"
                                disabled={page >= totalPages}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                Next <FaChevronRight />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CaseTabs;
