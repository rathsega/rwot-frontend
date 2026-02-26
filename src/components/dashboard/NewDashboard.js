import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaChartLine, FaUsers, FaHandshake, FaFileAlt, FaCheck, FaMoneyBillWave, FaArrowLeft, FaBuilding, FaUser, FaPhone, FaSearch, FaFileExcel, FaSpinner } from 'react-icons/fa';
import apiFetch from "../../utils/api";
import dayjs from "dayjs";

const NewDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusFilter = searchParams.get('status') || '';
  
  const [stats, setStats] = useState({
    today: 0,
    last7Days: 0,
    last30Days: 0,
    thisFinancialYear: 0,
    statusCounts: {},
    ratios: {
      leadsToMeeting: 0,
      meetingToDocuments: 0,
      documentsToBankerAcceptance: 0,
      bankerAcceptanceToSanction: 0,
      sanctionToDisbursement: 0
    },
    ratioCounts: {}
  });
  const [loading, setLoading] = useState(true);
  
  // Cases list state (when status filter is active)
  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseUrl}/cases/export-excel`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cases_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export cases report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Fetch stats when filters change
  const fetchStats = useCallback(() => {
    setLoading(true);
    
    // Build query params
    const params = new URLSearchParams();
    if (dateFilter && dateFilter !== 'all') params.append('dateFilter', dateFilter);
    if (dateFilter === 'custom') {
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
    }
    
    const queryString = params.toString();
    const url = `/cases/dashboard-stats${queryString ? `?${queryString}` : ''}`;
    
    apiFetch(url, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        setStats(res);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [dateFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch cases when status filter is active
  useEffect(() => {
    if (statusFilter) {
      setCasesLoading(true);
      apiFetch("/cases", { method: "GET", credentials: "include" })
        .then((res) => {
          let casesData = res.cases || res || [];
          // Filter by status
          casesData = casesData.filter(c => 
            c.status?.toLowerCase() === statusFilter.toLowerCase()
          );
          setCases(casesData);
        })
        .catch((err) => console.error(err))
        .finally(() => setCasesLoading(false));
    } else {
      setCases([]);
    }
  }, [statusFilter]);

  // Clear status filter
  const clearStatusFilter = () => {
    setSearchParams({});
  };

  // Filter cases by search
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

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    if (filter !== "custom") {
      setDateFrom("");
      setDateTo("");
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setDateFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const StatCard = ({ title, count, icon, gradient }) => (
    <div style={{
      background: gradient,
      border: "none",
      borderRadius: "12px",
      padding: "25px",
      textAlign: "center",
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      minWidth: "200px",
      color: "white",
      transition: "transform 0.2s",
      cursor: "pointer"
    }}
      onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ fontSize: "2.5em", marginBottom: "15px", opacity: 0.9 }}>
        {icon}
      </div>
      <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1em", fontWeight: "500", opacity: 0.9 }}>
        {title}
      </h3>
      <div style={{ fontSize: "2.2em", fontWeight: "bold" }}>
        {count}
      </div>
    </div>
  );

  const RatioCard = ({ title, percentage, icon, gradient, description, numerator, denominator }) => (
    <div style={{
      background: gradient,
      border: "none",
      borderRadius: "12px",
      padding: "20px",
      textAlign: "center",
      boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
      minWidth: "180px",
      color: "black",
      transition: "transform 0.2s",
      cursor: "pointer"
    }}
      onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ fontSize: "2em", marginBottom: "10px", opacity: 0.9 }}>
        {icon}
      </div>
      <h4 style={{ margin: "0 0 5px 0", fontSize: "0.9em", fontWeight: "500", opacity: 0.9 }}>
        {title}
      </h4>
      <div style={{ fontSize: "1.8em", fontWeight: "bold", marginBottom: "5px" }}>
        {percentage}%
      </div>
      <div style={{ fontSize: "1.2em", fontWeight: "600", marginBottom: "5px", opacity: 0.9 }}>
        {denominator} : {numerator}
      </div>
      <div style={{ fontSize: "0.7em", opacity: 0.8 }}>
        {description}
      </div>
    </div>
  );

  const StatusCard = ({ status, count }) => {
    const getStatusColor = (status) => {
      const colors = {
        'Open': '#e3f2fd',
        'Meeting Done': '#f3e5f5',
        'Documentation Initiated': '#fff3e0',
        'Documentation In Progress': '#fff8e1',
        'Underwriting': '#e8f5e8',
        'One Pager': '#fce4ec',
        'Banker Review': '#e1f5fe',
        'Completed': '#e8f5e8',
        'Unknown': '#f5f5f5'
      };
      return colors[status] || '#f0f0f0';
    };

    const getStatusTextColor = (status) => {
      const colors = {
        'Open': '#1976d2',
        'Meeting Done': '#7b1fa2',
        'Documentation Initiated': '#f57c00',
        'Documentation In Progress': '#ff8f00',
        'Underwriting': '#388e3c',
        'One Pager': '#c2185b',
        'Banker Review': '#0288d1',
        'Completed': '#2e7d32',
        'Unknown': '#616161'
      };
      return colors[status] || '#424242';
    };

    return (
      <div style={{
        background: getStatusColor(status),
        border: `1px solid ${getStatusTextColor(status)}20`,
        borderRadius: "8px",
        padding: "18px",
        margin: "8px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.2s",
        cursor: "pointer"
      }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateX(5px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateX(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <span style={{ fontWeight: "600", color: getStatusTextColor(status) }}>{status}</span>
        <span style={{
          background: getStatusTextColor(status),
          color: "black",
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "0.9em",
          fontWeight: "bold",
          minWidth: "30px",
          textAlign: "center"
        }}>
          <a href={`/dashboard/overview?status=${status}`}>{count}</a>
        </span>
      </div>
    );
  };

  return (
    <div style={{
      padding: "30px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh"
    }}>
      {/* Cases List View - when status filter is active */}
      {statusFilter ? (
        <div>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
            gap: "15px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button 
                onClick={clearStatusFilter}
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "600",
                  color: "#333",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
              >
                <FaArrowLeft /> Back to Dashboard
              </button>
              <div>
                <h2 style={{
                  color: "white",
                  fontSize: "2em",
                  fontWeight: "300",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  margin: 0
                }}>
                  {statusFilter} Cases
                </h2>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9em" }}>
                  {filteredCases.length} cases found
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "15px 20px",
            marginBottom: "25px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <FaSearch style={{ color: "#666" }} />
            <input
              type="text"
              placeholder="Search by company, client, case ID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "15px",
                background: "transparent"
              }}
            />
          </div>

          {/* Cases Grid */}
          {casesLoading ? (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
              color: "white",
              fontSize: "1.2em"
            }}>
              Loading cases...
            </div>
          ) : filteredCases.length === 0 ? (
            <div style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "12px",
              padding: "50px",
              textAlign: "center",
              color: "#666"
            }}>
              No cases found
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "20px"
            }}>
              {filteredCases.map((caseItem) => (
                <div
                  key={caseItem.caseid}
                  onClick={() => navigate(`/dashboard/case/${caseItem.caseid}`)}
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "12px",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{
                      background: getStatusColor(caseItem.status),
                      color: "white",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "0.8em",
                      fontWeight: "600"
                    }}>
                      {caseItem.status}
                    </span>
                    <span style={{ color: "#888", fontSize: "0.85em", display: "flex", alignItems: "center", gap: "5px" }}>
                      <FaCalendarAlt />
                      {dayjs(caseItem.createddate).format("DD MMM YYYY")}
                    </span>
                  </div>
                  
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "1.1em", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaBuilding style={{ color: "#666" }} />
                    {caseItem.companyname || 'Unknown Company'}
                  </h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666", fontSize: "0.9em" }}>
                      <FaUser />
                      <span>{caseItem.clientname || 'N/A'}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666", fontSize: "0.9em" }}>
                      <FaPhone />
                      <span>{caseItem.phonenumber || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div style={{ color: "#999", fontSize: "0.85em", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                    {caseItem.caseid}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
      <>
      {/* Dashboard Overview - default view */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <h2 style={{
          color: "white",
          fontSize: "2.5em",
          fontWeight: "300",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          margin: 0
        }}>
          Dashboard Overview
        </h2>
        
        {/* Filters Container */}
        <div style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          alignItems: "flex-end"
        }}>
          {/* Date Filter Dropdown */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            padding: "10px 15px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minWidth: "200px"
          }}>
            <label style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              color: "#666",
              marginBottom: "5px"
            }}>
              Date Filter
            </label>
            <select
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                background: "#fff",
                cursor: "pointer",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="thisweek">This Week</option>
              <option value="thismonth">This Month</option>
              <option value="thisyear">This Year</option>
              <option value="financialyear">Financial Year</option>
              <option value="lastfinancialyear">Last Financial Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range (Only show when "Custom Range" is selected) */}
          {dateFilter === "custom" && (
            <>
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "10px 15px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                minWidth: "180px"
              }}>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666",
                  marginBottom: "5px"
                }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    background: "#fff",
                    cursor: "pointer",
                    outline: "none",
                    transition: "border-color 0.2s ease"
                  }}
                />
              </div>

              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "10px 15px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                minWidth: "180px"
              }}>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666",
                  marginBottom: "5px"
                }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    background: "#fff",
                    cursor: "pointer",
                    outline: "none",
                    transition: "border-color 0.2s ease"
                  }}
                />
              </div>
            </>
          )}

          {/* Clear Filters Button */}
          <button
            onClick={clearAllFilters}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "all 0.2s ease",
              height: "fit-content",
              alignSelf: "flex-end"
            }}
            onMouseOver={(e) => e.target.style.background = "#b91c1c"}
            onMouseOut={(e) => e.target.style.background = "#dc2626"}
          >
            Clear Filters
          </button>

          {/* Export to Excel Button */}
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            style={{
              background: exporting ? "#86efac" : "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: exporting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "all 0.2s ease",
              height: "fit-content",
              alignSelf: "flex-end",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onMouseOver={(e) => !exporting && (e.target.style.background = "#15803d")}
            onMouseOut={(e) => !exporting && (e.target.style.background = "#16a34a")}
          >
            {exporting ? (
              <><FaSpinner style={{ animation: "spin 1s linear infinite" }} /> Exporting...</>
            ) : (
              <><FaFileExcel /> Download Report</>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
          color: "white",
          fontSize: "1.2em"
        }}>
          Loading dashboard statistics...
        </div>
      ) : (
        <>
        {/* Time Period Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "25px",
          marginBottom: "50px"
        }}>
          <StatCard
            title="Today"
            count={stats.today}
            icon={<FaCalendarDay />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <StatCard
            title="Last 7 Days"
            count={stats.last7Days}
          icon={<FaCalendarWeek />}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          title="Last 30 Days"
          count={stats.last30Days}
          icon={<FaCalendarAlt />}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        <StatCard
          title="This Financial Year"
          count={stats.thisFinancialYear}
          icon={<FaChartLine />}
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />
      </div>

      {/* Conversion Ratios */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "16px",
        padding: "30px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        marginBottom: "30px"
      }}>
        <h3 style={{
          marginBottom: "25px",
          color: "#333",
          fontSize: "1.8em",
          fontWeight: "600",
          textAlign: "center"
        }}>
          Lead Generation vs Disbursement Ratios
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          <RatioCard
            title="Leads to Meeting"
            percentage={stats.ratios.leadsToMeeting}
            icon={<FaUsers />}
            gradient="linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
            description="Lead Conversion"
            numerator={stats.ratioCounts?.leadsToMeeting?.num || 0}
            denominator={stats.ratioCounts?.leadsToMeeting?.den || 0}
          />
          <RatioCard
            title="Meeting to Documents"
            percentage={stats.ratios.meetingToDocuments}
            icon={<FaHandshake />}
            gradient="linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"
            description="Documentation Rate"
            numerator={stats.ratioCounts?.meetingToDocuments?.num || 0}
            denominator={stats.ratioCounts?.meetingToDocuments?.den || 0}
          />
          <RatioCard
            title="Documents to Banker Acceptance"
            percentage={stats.ratios.documentsToBankerAcceptance}
            icon={<FaFileAlt />}
            gradient="linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)"
            description="Banker Approval"
            numerator={stats.ratioCounts?.documentsToBankerAcceptance?.num || 0}
            denominator={stats.ratioCounts?.documentsToBankerAcceptance?.den || 0}
          />
          <RatioCard
            title="Banker Acceptance to Sanction"
            percentage={stats.ratios.bankerAcceptanceToSanction}
            icon={<FaCheck />}
            gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
            description="Sanction Rate"
            numerator={stats.ratioCounts?.bankerAcceptanceToSanction?.num || 0}
            denominator={stats.ratioCounts?.bankerAcceptanceToSanction?.den || 0}
          />
          <RatioCard
            title="Sanction to Disbursement"
            percentage={stats.ratios.sanctionToDisbursement}
            icon={<FaMoneyBillWave />}
            gradient="linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)"
            description="Disbursement Rate"
            numerator={stats.ratioCounts?.sanctionToDisbursement?.num || 0}
            denominator={stats.ratioCounts?.sanctionToDisbursement?.den || 0}
          />
        </div>
      </div>

      {/* Status Wise Breakdown */}
      {/* <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "16px",
        padding: "30px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{
          marginBottom: "25px",
          color: "#333",
          fontSize: "1.8em",
          fontWeight: "600",
          textAlign: "center"
        }}>
          Cases by Status
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "15px"
        }}>
          {Object.entries(stats.statusCounts).map(([status, count]) => (
            <StatusCard key={status} status={status} count={count} />
          ))}
        </div>
      </div> */}
        </>
      )}
      </>
      )}
    </div>
  );
};

export default NewDashboard;