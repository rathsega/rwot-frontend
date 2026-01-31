import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaBuilding, FaUser, FaPhone, FaCalendarAlt, FaSearch } from "react-icons/fa";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import "./CasesListPage.css";

const CasesListPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { token } = useAuth() || {};
    
    const statusFilter = searchParams.get('status') || '';
    const userIdFilter = searchParams.get('userId') || '';
    const dateFilterParam = searchParams.get('dateFilter') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // Calculate date range based on dateFilter parameter
    const getDateRange = (filter) => {
        const now = dayjs();
        let filterStart = null;
        let filterEnd = null;
        
        switch(filter) {
            case 'today':
                filterStart = now.startOf('day');
                filterEnd = now.endOf('day');
                break;
            case 'yesterday':
                filterStart = now.subtract(1, 'day').startOf('day');
                filterEnd = now.subtract(1, 'day').endOf('day');
                break;
            case 'last7days':
                filterStart = now.subtract(7, 'day').startOf('day');
                filterEnd = now.endOf('day');
                break;
            case 'last30days':
                filterStart = now.subtract(30, 'day').startOf('day');
                filterEnd = now.endOf('day');
                break;
            case 'thisweek':
                filterStart = now.startOf('week');
                filterEnd = now.endOf('day');
                break;
            case 'thismonth':
                filterStart = now.startOf('month');
                filterEnd = now.endOf('day');
                break;
            case 'thisyear':
                filterStart = now.startOf('year');
                filterEnd = now.endOf('day');
                break;
            case 'financialyear':
                // Financial year starts April 1st
                filterStart = now.month() >= 3
                    ? dayjs().month(3).date(1).startOf('day')
                    : dayjs().subtract(1, 'year').month(3).date(1).startOf('day');
                filterEnd = now.endOf('day');
                break;
            case 'lastfinancialyear':
                filterStart = now.month() >= 3
                    ? dayjs().subtract(1, 'year').month(3).date(1).startOf('day')
                    : dayjs().subtract(2, 'year').month(3).date(1).startOf('day');
                filterEnd = now.month() >= 3
                    ? dayjs().month(3).date(1).subtract(1, 'day').endOf('day')
                    : dayjs().subtract(1, 'year').month(3).date(1).subtract(1, 'day').endOf('day');
                break;
            case 'custom':
                // Custom uses dateFrom and dateTo directly
                break;
            default:
                break;
        }
        return { filterStart, filterEnd };
    };

    useEffect(() => {
        fetchCases();
    }, [statusFilter, userIdFilter, dateFilterParam, dateFrom, dateTo]);

    const fetchCases = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await apiFetch("/cases", { method: "GET", token });
            let casesData = res.cases || res || [];
            
            // Apply status filter
            if (statusFilter) {
                casesData = casesData.filter(c => 
                    c.status?.toLowerCase() === statusFilter.toLowerCase()
                );
            }
            
            // Apply user filter
            if (userIdFilter) {
                casesData = casesData.filter(c => 
                    c.assignments?.some(a => a.assigned_to_id === parseInt(userIdFilter)) ||
                    c.createdby === parseInt(userIdFilter)
                );
            }
            
            // Apply date filters based on dateFilter param or custom range
            if (dateFilterParam && dateFilterParam !== 'all') {
                const { filterStart, filterEnd } = getDateRange(dateFilterParam);
                
                if (dateFilterParam === 'custom') {
                    // Use custom date range
                    if (dateFrom) {
                        const fromDate = dayjs(dateFrom).startOf('day');
                        casesData = casesData.filter(c => 
                            dayjs(c.createddate).isAfter(fromDate) || dayjs(c.createddate).isSame(fromDate, 'day')
                        );
                    }
                    if (dateTo) {
                        const toDate = dayjs(dateTo).endOf('day');
                        casesData = casesData.filter(c => 
                            dayjs(c.createddate).isBefore(toDate) || dayjs(c.createddate).isSame(toDate, 'day')
                        );
                    }
                } else if (filterStart && filterEnd) {
                    casesData = casesData.filter(c => {
                        const caseDate = dayjs(c.createddate);
                        return (caseDate.isAfter(filterStart) || caseDate.isSame(filterStart, 'day')) &&
                               (caseDate.isBefore(filterEnd) || caseDate.isSame(filterEnd, 'day'));
                    });
                }
            } else {
                // Legacy support: use dateFrom/dateTo directly if no dateFilter
                if (dateFrom) {
                    const fromDate = dayjs(dateFrom).startOf('day');
                    casesData = casesData.filter(c => 
                        dayjs(c.createddate).isAfter(fromDate) || dayjs(c.createddate).isSame(fromDate, 'day')
                    );
                }
                if (dateTo) {
                    const toDate = dayjs(dateTo).endOf('day');
                    casesData = casesData.filter(c => 
                        dayjs(c.createddate).isBefore(toDate) || dayjs(c.createddate).isSame(toDate, 'day')
                    );
                }
            }
            
            setCases(casesData);
        } catch (err) {
            setError(err.message || "Failed to fetch cases");
        } finally {
            setLoading(false);
        }
    };

    // Filter by search
    const filteredCases = cases.filter(c => {
        if (!search.trim()) return true;
        const searchLower = search.toLowerCase();
        return (
            c.companyname?.toLowerCase().includes(searchLower) ||
            c.clientname?.toLowerCase().includes(searchLower) ||
            c.caseid?.toLowerCase().includes(searchLower) ||
            c.phonenumber?.includes(search)
        );
    });

    const getStatusColor = (status) => {
        const colors = {
            'open': '#3b82f6',
            'meeting done': '#8b5cf6',
            'documentation initiated': '#f59e0b',
            'documentation in progress': '#f97316',
            'underwriting': '#10b981',
            'one pager': '#ec4899',
            'banker review': '#06b6d4',
            'login': '#6366f1',
            'pd': '#14b8a6',
            'sanctioned': '#22c55e',
            'disbursement': '#84cc16',
            'done': '#10b981',
            'rejected': '#ef4444',
            'no requirement': '#6b7280'
        };
        return colors[status?.toLowerCase()] || '#6b7280';
    };

    // Get filter description for display
    const getFilterDescription = () => {
        const parts = [];
        if (dateFilterParam && dateFilterParam !== 'all') {
            const filterLabels = {
                'today': 'Today',
                'yesterday': 'Yesterday',
                'last7days': 'Last 7 Days',
                'last30days': 'Last 30 Days',
                'thisweek': 'This Week',
                'thismonth': 'This Month',
                'thisyear': 'This Year',
                'financialyear': 'Financial Year',
                'lastfinancialyear': 'Last Financial Year',
                'custom': dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : 'Custom Range'
            };
            parts.push(filterLabels[dateFilterParam] || dateFilterParam);
        }
        if (userIdFilter) {
            parts.push('User Filtered');
        }
        return parts.length > 0 ? ` (${parts.join(', ')})` : '';
    };

    return (
        <div className="cases-list-page">
            {/* Header */}
            <div className="cases-list-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>
                <div className="header-info">
                    <h1>
                        {statusFilter ? `${statusFilter} Cases` : 'All Cases'}
                        <span style={{ fontSize: '0.6em', fontWeight: 'normal', color: '#666' }}>
                            {getFilterDescription()}
                        </span>
                    </h1>
                    <span className="case-count">{filteredCases.length} cases found</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="cases-search-bar">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by company, client, case ID, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Cases Grid */}
            {loading ? (
                <div className="cases-loading">
                    <div className="spinner"></div>
                    <p>Loading cases...</p>
                </div>
            ) : error ? (
                <div className="cases-error">
                    <p>{error}</p>
                    <button onClick={fetchCases}>Retry</button>
                </div>
            ) : filteredCases.length === 0 ? (
                <div className="cases-empty">
                    <p>No cases found</p>
                </div>
            ) : (
                <div className="cases-grid">
                    {filteredCases.map((caseItem) => (
                        <div
                            key={caseItem.caseid}
                            className="case-item"
                            onClick={() => navigate(`/dashboard/case/${caseItem.caseid}`)}
                        >
                            <div className="case-item-header">
                                <span 
                                    className="case-status-badge"
                                    style={{ backgroundColor: getStatusColor(caseItem.status) }}
                                >
                                    {caseItem.status}
                                </span>
                                <span className="case-date">
                                    <FaCalendarAlt />
                                    {dayjs(caseItem.createddate).format("DD MMM YYYY")}
                                </span>
                            </div>
                            
                            <h3 className="case-company">
                                <FaBuilding />
                                {caseItem.companyname || 'Unknown Company'}
                            </h3>
                            
                            <div className="case-details">
                                <div className="case-detail">
                                    <FaUser />
                                    <span>{caseItem.clientname || 'N/A'}</span>
                                </div>
                                <div className="case-detail">
                                    <FaPhone />
                                    <span>{caseItem.phonenumber || 'N/A'}</span>
                                </div>
                            </div>
                            
                            <div className="case-id">
                                {caseItem.caseid}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CasesListPage;
