import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaChartLine, FaUsers, FaHandshake, FaFileAlt, FaCheck, FaMoneyBillWave } from 'react-icons/fa';
import apiFetch from "../../utils/api";

const UsersDashboard = () => {
  const navigate = useNavigate();
  const userDropdownRef = useRef(null);
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
    ratioCounts: {},
    totalFiltered: 0
  });
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch users list on mount
  useEffect(() => {
    apiFetch("/users/getKamAndTelecallers", {
      method: "GET",    
      credentials: "include",
    })
      .then((res) => {
        const usersData = res.users || res;
        setUsers(usersData);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch stats when filters change
  const fetchStats = useCallback(() => {
    setLoading(true);
    
    // Build query params
    const params = new URLSearchParams();
    if (selectedUserIds.length > 0) {
      params.append('userIds', selectedUserIds.join(','));
    }
    if (dateFilter && dateFilter !== 'all') params.append('dateFilter', dateFilter);
    if (dateFilter === 'custom') {
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
    }
    
    const queryString = params.toString();
    const url = `/cases/user-dashboard-stats${queryString ? `?${queryString}` : ''}`;
    
    apiFetch(url, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        setStats(res);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedUserIds, dateFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleUserChange = (userId) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => String(u.id)));
    }
  };

  const clearUserSelection = () => {
    setSelectedUserIds([]);
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    if (filter !== "custom") {
      setDateFrom("");
      setDateTo("");
    }
  };

  const handleDateFromChange = (date) => {
    setDateFrom(date);
  };

  const handleDateToChange = (date) => {
    setDateTo(date);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedUserIds([]);
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

  const StatusCard = ({ status, count, onClick }) => {
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
        onClick={onClick}
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
          color: "white",
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "0.9em",
          fontWeight: "bold",
          minWidth: "30px",
          textAlign: "center"
        }}>
          {count}
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
          User's Dashboard Overview
        </h2>
        
        {/* ✅ Filters Container */}
        <div style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          alignItems: "flex-end"
        }}>
          {/* ✅ Date Filter Dropdown */}
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

          {/* ✅ Custom Date Range (Only show when "Custom Range" is selected) */}
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
                  onChange={(e) => handleDateFromChange(e.target.value)}
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
                  onChange={(e) => handleDateToChange(e.target.value)}
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

          {/* User Filter Dropdown - Multi-select */}
          <div 
            ref={userDropdownRef}
            style={{
            background: "rgba(255, 255, 255, 0.95)",
            padding: "10px 15px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minWidth: "280px",
            position: "relative"
          }}>
            <label style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              color: "#666",
              marginBottom: "5px"
            }}>
              Filter by Users
            </label>
            <div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: "38px"
              }}
            >
              <span style={{ 
                overflow: "hidden", 
                textOverflow: "ellipsis", 
                whiteSpace: "nowrap",
                flex: 1,
                color: selectedUserIds.length === 0 ? "#999" : "#333"
              }}>
                {selectedUserIds.length === 0 
                  ? "All Users" 
                  : selectedUserIds.length === 1
                    ? users.find(u => String(u.id) === selectedUserIds[0])?.name || "1 user selected"
                    : `${selectedUserIds.length} users selected`}
              </span>
              <span style={{ marginLeft: "8px", color: "#666" }}>▼</span>
            </div>
            
            {userDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#fff",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                marginTop: "4px",
                maxHeight: "250px",
                overflowY: "auto",
                zIndex: 1000,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}>
                {/* Select All / Clear All buttons */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderBottom: "1px solid #e2e8f0",
                  background: "#f8fafc"
                }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSelectAllUsers(); }}
                    style={{
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    {selectedUserIds.length === users.length ? "Deselect All" : "Select All"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearUserSelection(); }}
                    style={{
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Clear
                  </button>
                </div>
                
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={(e) => { e.stopPropagation(); handleUserChange(String(user.id)); }}
                    style={{
                      padding: "8px 10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: selectedUserIds.includes(String(user.id)) ? "#e0f2fe" : "transparent",
                      borderBottom: "1px solid #f1f5f9"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = selectedUserIds.includes(String(user.id)) ? "#bae6fd" : "#f1f5f9"}
                    onMouseOut={(e) => e.currentTarget.style.background = selectedUserIds.includes(String(user.id)) ? "#e0f2fe" : "transparent"}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(String(user.id))}
                      onChange={() => {}}
                      style={{ cursor: "pointer" }}
                    />
                    <span>{user.name} - {user.rolename}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Clear Filters Button */}
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
        <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(200px, 1fr))","gap":"20px"}}>
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
      <div style={{
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
          {Object.entries(stats.statusCounts).map(([status, count]) => {
            // Build navigation URL with all active filters
            const params = new URLSearchParams();
            params.append('status', status);
            if (selectedUserIds.length > 0) params.append('userIds', selectedUserIds.join(','));
            if (dateFilter && dateFilter !== 'all') params.append('dateFilter', dateFilter);
            if (dateFilter === 'custom') {
              if (dateFrom) params.append('dateFrom', dateFrom);
              if (dateTo) params.append('dateTo', dateTo);
            }
            const navUrl = `/dashboard/cases?${params.toString()}`;
            
            return (
              <StatusCard 
                key={status} 
                status={status} 
                count={count} 
                onClick={() => navigate(navUrl)} 
              />
            );
          })}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default UsersDashboard;