import React, { useEffect, useState, useCallback } from "react";
import { FaPlus, FaEye, FaRegCommentDots, FaSearch, FaSpinner } from "react-icons/fa";
import "./dashboard-theme.css";
import apiFetch from "../../utils/api";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { useColdCaseThreshold } from "../../hooks/useSettings";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);

// Helper to format date as "31st Jan, 2026"
const formatDateWithOrdinal = (dateStr) => {
  if (!dateStr) return "--";
  const d = dayjs(dateStr);
  if (!d.isValid()) return "--";
  return d.format("Do MMM, YYYY");
};

const ITEMS_PER_PAGE = 20;

const DashboardOverviewOptimized = () => {
  const { coldCaseThresholdHours } = useColdCaseThreshold();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounce, setSearchDebounce] = useState(null);
  const [commentModal, setCommentModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [userForm, setUserForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    company: "",
  });
  const [roles, setRoles] = useState([]);
  const [assigneeOptions, setAssigneeOptions] = useState([]);

  // Multi-select dropdown states
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);
  const stageDropdownRef = React.useRef(null);
  const assigneeDropdownRef = React.useRef(null);

  // Centralized filter state - status and assignee are now arrays
  const [filters, setFilters] = useState({
    status: [],
    time: "",
    assignee: [],
    search: "",
    dateFrom: "",
    dateTo: ""
  });

  // Fetch cases with pagination and filters
  const fetchCases = useCallback(async (page = 1, appendResults = false) => {
    if (appendResults) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      // Build query params
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", ITEMS_PER_PAGE);
      
      // Handle multi-select status filter (exclude Cold which is client-side)
      const serverStatuses = filters.status.filter(s => s !== "Cold");
      if (serverStatuses.length > 0) {
        params.set("status", serverStatuses.join(','));
      }
      
      if (filters.search) {
        params.set("search", filters.search);
      }

      // Add date filters for server-side filtering
      if (filters.time === "Custom") {
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);
      } else if (filters.time) {
        const dateRange = getDateRange(filters.time);
        if (dateRange) {
          params.set("dateFrom", dateRange.start.format("YYYY-MM-DD"));
          params.set("dateTo", dateRange.end.format("YYYY-MM-DD"));
        }
      }

      const res = await apiFetch(`/cases/list?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      let fetchedCases = res.cases || [];

      // Apply client-side filters that aren't available server-side
      // Cold case filter
      if (filters.status.includes("Cold")) {
        fetchedCases = fetchedCases.filter((c) =>
          c.status_updated_on &&
          dayjs().diff(dayjs(c.status_updated_on), "hour") > coldCaseThresholdHours
        );
      }

      // Assignee filter (client-side since we need nested data) - now multi-select
      if (filters.assignee.length > 0) {
        const selectedAssignees = filters.assignee.map(a => a.toLowerCase());
        fetchedCases = fetchedCases.filter((c) => {
          const kamName = (c.kam_name || "").toLowerCase();
          const telecallerName = (c.telecaller_name || "").toLowerCase();
          return selectedAssignees.includes(kamName) || selectedAssignees.includes(telecallerName);
        });
      }

      if (appendResults) {
        setCases(prev => [...prev, ...fetchedCases]);
      } else {
        setCases(fetchedCases);
      }

      setPagination({
        page: res.pagination?.page || page,
        total: res.pagination?.total || 0,
        totalPages: res.pagination?.totalPages || 0,
        hasMore: res.pagination?.hasMore || false
      });

      // Build assignee options from fetched data
      if (!appendResults && fetchedCases.length > 0) {
        const assignees = new Map();
        fetchedCases.forEach(c => {
          if (c.kam_name) {
            assignees.set(c.kam_name, { name: c.kam_name, role: "KAM" });
          }
          if (c.telecaller_name) {
            assignees.set(c.telecaller_name, { name: c.telecaller_name, role: "Telecaller" });
          }
        });
        setAssigneeOptions(Array.from(assignees.values()));
      }

    } catch (err) {
      console.error("Error fetching cases:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, coldCaseThresholdHours]);

  // Get date range based on filter type
  const getDateRange = (filter) => {
    const now = dayjs();
    
    switch(filter) {
      case "Today":
        return { start: now.startOf('day'), end: now.endOf('day') };
      case "Yesterday":
        return { 
          start: now.subtract(1, 'day').startOf('day'), 
          end: now.subtract(1, 'day').endOf('day') 
        };
      case "Last 7 Days":
        return { 
          start: now.subtract(7, 'day').startOf('day'), 
          end: now.endOf('day') 
        };
      case "Last 30 Days":
        return { 
          start: now.subtract(30, 'day').startOf('day'), 
          end: now.endOf('day') 
        };
      case "This Week":
        return { 
          start: now.startOf('isoWeek'), 
          end: now.endOf('isoWeek') 
        };
      case "This Month":
        return { 
          start: now.startOf('month'), 
          end: now.endOf('month') 
        };
      case "This Year":
        return { 
          start: now.startOf('year'), 
          end: now.endOf('year') 
        };
      case "Financial Year":
        const fyStart = now.month() >= 3 
          ? now.month(3).startOf('month') 
          : now.subtract(1, 'year').month(3).startOf('month');
        const fyEnd = now.month() >= 3 
          ? now.add(1, 'year').month(2).endOf('month') 
          : now.month(2).endOf('month');
        return { start: fyStart, end: fyEnd };
      case "Last Financial Year":
        const lastFyStart = now.month() >= 3 
          ? now.subtract(1, 'year').month(3).startOf('month') 
          : now.subtract(2, 'year').month(3).startOf('month');
        const lastFyEnd = now.month() >= 3 
          ? now.month(2).endOf('month') 
          : now.subtract(1, 'year').month(2).endOf('month');
        return { start: lastFyStart, end: lastFyEnd };
      default:
        return null;
    }
  };

  // Get query param for status filter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status) {
      // Support comma-separated statuses from URL
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
      setFilters(prev => ({ ...prev, status: statuses }));
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stageDropdownRef.current && !stageDropdownRef.current.contains(event.target)) {
        setStageDropdownOpen(false);
      }
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target)) {
        setAssigneeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch cases when filters change
  useEffect(() => {
    fetchCases(1, false);
  }, [filters.status, filters.time, filters.assignee, filters.dateFrom, filters.dateTo]);

  // Debounced search
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    const timeout = setTimeout(() => {
      if (filters.search !== searchTerm) {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        fetchCases(1, false);
      }
    }, 500);
    
    setSearchDebounce(timeout);
    
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await apiFetch("/roles", {
          method: "GET",
          credentials: "include",
        });
        if (Array.isArray(res?.roles)) {
          setRoles(res.roles);
        } else if (Array.isArray(res)) {
          setRoles(res);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };
    fetchRoles();
  }, []);

  // Load comments for modal
  useEffect(() => {
    if (commentModal?.caseid) {
      apiFetch(`/comments/${commentModal.caseid}`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => {
          setCommentModal((prev) => ({
            ...prev,
            comments: res.comments || [],
          }));
        })
        .catch((err) => console.error(err));
    }
  }, [commentModal?.caseid]);

  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchCases(pagination.page + 1, true);
    }
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const updated = { ...prev, [filterType]: value };
      if (filterType === "time" && value !== "Custom") {
        updated.dateFrom = "";
        updated.dateTo = "";
      }
      return updated;
    });
  };

  // Toggle selection for multi-select filters
  const handleMultiSelectToggle = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType] || [];
      if (currentValues.includes(value)) {
        return { ...prev, [filterType]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [filterType]: [...currentValues, value] };
      }
    });
  };

  // Select all / clear all for multi-select
  const handleSelectAllStages = (allStages) => {
    if (filters.status.length === allStages.length) {
      setFilters(prev => ({ ...prev, status: [] }));
    } else {
      setFilters(prev => ({ ...prev, status: [...allStages] }));
    }
  };

  const handleSelectAllAssignees = () => {
    if (filters.assignee.length === assigneeOptions.length) {
      setFilters(prev => ({ ...prev, assignee: [] }));
    } else {
      setFilters(prev => ({ ...prev, assignee: assigneeOptions.map(a => a.name) }));
    }
  };

  const handleDateChange = (dateType, value) => {
    setFilters(prev => ({ ...prev, [dateType]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: [],
      time: "",
      assignee: [],
      search: "",
      dateFrom: "",
      dateTo: ""
    });
    setSearchTerm("");
  };

  const handleUserInput = (e) =>
    setUserForm({ ...userForm, [e.target.name]: e.target.value });

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (userForm.password.length !== 10) {
      alert("Password must be exactly 10 characters.");
      return;
    }
    try {
      const checkRes = await apiFetch(`/users/check-email?email=${userForm.email}`, {
        method: "GET",
        credentials: "include",
      });
      if (checkRes.exists) {
        alert("Email already exists. Please use a different one.");
        return;
      }
    } catch (err) {
      console.error("Email check failed", err);
    }

    apiFetch("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userForm),
    })
      .then((res) => {
        if (res.error) {
          alert(res.error || "Failed to add user");
        } else {
          alert("User added successfully");
          document.getElementById("addUserModal").close();
          setUserForm({
            fullname: "",
            email: "",
            phone: "",
            password: "",
            role: "",
            company: "",
          });
        }
      })
      .catch(() => alert("Failed to add user"));
  };

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>

      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div className="dashboard-filters" style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
          {/* Search Input */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                paddingRight: "35px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                minWidth: "200px"
              }}
            />
            <FaSearch style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666"
            }} />
          </div>

          {/* Stage Multi-select Dropdown */}
          <div ref={stageDropdownRef} style={{ position: "relative", minWidth: "180px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Stage:</label>
            <div
              onClick={() => setStageDropdownOpen(!stageDropdownOpen)}
              style={{
                padding: "8px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: "36px"
              }}
            >
              <span style={{ 
                overflow: "hidden", 
                textOverflow: "ellipsis", 
                whiteSpace: "nowrap",
                flex: 1,
                color: filters.status.length === 0 ? "#666" : "#333"
              }}>
                {filters.status.length === 0 
                  ? "All" 
                  : filters.status.length === 1
                    ? filters.status[0]
                    : `${filters.status.length} selected`}
              </span>
              <span style={{ marginLeft: "8px", color: "#666" }}>▼</span>
            </div>
            
            {stageDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                marginTop: "2px",
                maxHeight: "250px",
                overflowY: "auto",
                zIndex: 1000,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}>
                {(() => {
                  const allStages = ["Open", "Meeting Done", "Documentation Initiated", "Documentation In Progress", "Underwriting", "One Pager", "Banker Review", "Disbursement", "Done", "No Requirement", "Cold"];
                  return (
                    <>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 10px",
                        borderBottom: "1px solid #eee",
                        background: "#f8fafc"
                      }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleSelectAllStages(allStages); }}
                          style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "3px 8px",
                            fontSize: "11px",
                            cursor: "pointer"
                          }}
                        >
                          {filters.status.length === allStages.length ? "Deselect All" : "Select All"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFilters(prev => ({ ...prev, status: [] })); }}
                          style={{
                            background: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "3px 8px",
                            fontSize: "11px",
                            cursor: "pointer"
                          }}
                        >
                          Clear
                        </button>
                      </div>
                      {allStages.map((stage) => (
                        <div
                          key={stage}
                          onClick={(e) => { e.stopPropagation(); handleMultiSelectToggle("status", stage); }}
                          style={{
                            padding: "6px 10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: filters.status.includes(stage) ? "#e0f2fe" : "transparent",
                            borderBottom: "1px solid #f1f5f9"
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = filters.status.includes(stage) ? "#bae6fd" : "#f1f5f9"}
                          onMouseOut={(e) => e.currentTarget.style.background = filters.status.includes(stage) ? "#e0f2fe" : "transparent"}
                        >
                          <input
                            type="checkbox"
                            checked={filters.status.includes(stage)}
                            onChange={() => {}}
                            style={{ cursor: "pointer" }}
                          />
                          <span style={{ fontSize: "13px" }}>{stage}</span>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <label>
            Time:
            <select
              className="filter-select"
              value={filters.time}
              onChange={(e) => handleFilterChange("time", e.target.value)}
            >
              <option value="">All Time</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
              <option value="Financial Year">Financial Year</option>
              <option value="Last Financial Year">Last Financial Year</option>
              <option value="Custom">Custom Range</option>
            </select>
          </label>

          {/* Custom Date Range Inputs */}
          {filters.time === "Custom" && (
            <>
              <label>
                From Date:
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleDateChange("dateFrom", e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    marginLeft: "5px"
                  }}
                />
              </label>

              <label>
                To Date:
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleDateChange("dateTo", e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    marginLeft: "5px"
                  }}
                />
              </label>
            </>
          )}

          {/* Assignee Multi-select Dropdown */}
          <div ref={assigneeDropdownRef} style={{ position: "relative", minWidth: "180px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Assignee:</label>
            <div
              onClick={() => setAssigneeDropdownOpen(!assigneeDropdownOpen)}
              style={{
                padding: "8px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: "36px"
              }}
            >
              <span style={{ 
                overflow: "hidden", 
                textOverflow: "ellipsis", 
                whiteSpace: "nowrap",
                flex: 1,
                color: filters.assignee.length === 0 ? "#666" : "#333"
              }}>
                {filters.assignee.length === 0 
                  ? "All" 
                  : filters.assignee.length === 1
                    ? filters.assignee[0]
                    : `${filters.assignee.length} selected`}
              </span>
              <span style={{ marginLeft: "8px", color: "#666" }}>▼</span>
            </div>
            
            {assigneeDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                marginTop: "2px",
                maxHeight: "250px",
                overflowY: "auto",
                zIndex: 1000,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 10px",
                  borderBottom: "1px solid #eee",
                  background: "#f8fafc"
                }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSelectAllAssignees(); }}
                    style={{
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "3px 8px",
                      fontSize: "11px",
                      cursor: "pointer"
                    }}
                  >
                    {filters.assignee.length === assigneeOptions.length ? "Deselect All" : "Select All"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFilters(prev => ({ ...prev, assignee: [] })); }}
                    style={{
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "3px 8px",
                      fontSize: "11px",
                      cursor: "pointer"
                    }}
                  >
                    Clear
                  </button>
                </div>
                {assigneeOptions.map((a, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); handleMultiSelectToggle("assignee", a.name); }}
                    style={{
                      padding: "6px 10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: filters.assignee.includes(a.name) ? "#e0f2fe" : "transparent",
                      borderBottom: "1px solid #f1f5f9"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = filters.assignee.includes(a.name) ? "#bae6fd" : "#f1f5f9"}
                    onMouseOut={(e) => e.currentTarget.style.background = filters.assignee.includes(a.name) ? "#e0f2fe" : "transparent"}
                  >
                    <input
                      type="checkbox"
                      checked={filters.assignee.includes(a.name)}
                      onChange={() => {}}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "13px" }}>{a.name} - {a.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={clearAllFilters}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "background 0.2s"
            }}
            onMouseOver={(e) => e.target.style.background = "#b91c1c"}
            onMouseOut={(e) => e.target.style.background = "#dc2626"}
          >
            Clear Filters
          </button>
        </div>

        <button className="add-user-btn" onClick={() => document.getElementById("addUserModal").showModal()}>
          <FaPlus /> Add User
        </button>
      </div>
      
      <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span>Showing {cases.length} of {pagination.total} cases</span>
        {loading && <FaSpinner className="spin" style={{ animation: "spin 1s linear infinite" }} />}
      </div>

      {loading && cases.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <FaSpinner style={{ fontSize: "32px", animation: "spin 1s linear infinite" }} />
          <p>Loading cases...</p>
        </div>
      ) : (
        <>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Assigned KAM</th>
                <th>Telecaller</th>
                <th>Meeting Done Date</th>
                <th>Stage</th>
                <th>Bank</th>
                <th>Comments</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c, i) => (
                <tr key={c.caseid || i}>
                  <td>{c.companyname || "--"}</td>
                  <td>{c.kam_name || "--"}</td>
                  <td>{c.telecaller_name || "--"}</td>
                  <td>{formatDateWithOrdinal(c?.meeting_done_date)}</td>
                  <td>{c.status || "--"}</td>
                  <td>
                    {c?.bank_assignments?.map((element, idx) => (
                      <p key={idx}>{element.bank_name} - {element.status}</p>
                    )) || (c.bank_count > 0 ? `${c.bank_count} bank(s)` : "--")}
                  </td>
                  <td>
                    <FaRegCommentDots
                      style={{ cursor: "pointer" }}
                      onClick={() => document.getElementById("commentModal").showModal() || setCommentModal(c)}
                    />
                    {c.comment_count > 0 && <span style={{ marginLeft: "4px", fontSize: "12px" }}>({c.comment_count})</span>}
                  </td>
                  <td>
                    <FaEye
                      style={{ cursor: "pointer" }}
                      onClick={() => document.getElementById("viewModal").showModal() || setViewModal(c)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.hasMore && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 32px",
                  cursor: loadingMore ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  margin: "0 auto"
                }}
              >
                {loadingMore ? (
                  <>
                    <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                    Loading...
                  </>
                ) : (
                  `Load More (${pagination.total - cases.length} remaining)`
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Add User Modal */}
      <dialog id="addUserModal">
        <form method="dialog" onSubmit={handleUserSubmit}>
          <h3>Add User</h3>
          <input
            name="fullname"
            placeholder="Full Name"
            onChange={handleUserInput}
            required
          />
          <input
            name="email"
            placeholder="Email"
            onChange={handleUserInput}
            required
          />
          <input
            name="phone"
            placeholder="Phone"
            onChange={handleUserInput}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password (10 chars)"
            onChange={handleUserInput}
            required
          />
          <select name="role" value={userForm.role} onChange={handleUserInput} required>
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.rolename}>
                {r.rolename}
              </option>
            ))}
          </select>
          <input
            name="company"
            placeholder="Company"
            onChange={handleUserInput}
            required
          />
          <button type="submit">Submit</button>
          <button onClick={() => document.getElementById("addUserModal").close()}>
            Cancel
          </button>
        </form>
      </dialog>

      {/* Comments Modal */}
      <dialog id="commentModal">
        {commentModal && (
          <>
            <h3>Comments for {commentModal.companyname}</h3>
            <ul>
              {(commentModal.comments || []).map((com, idx) => (
                <li key={idx}>
                  <b>{com.role}:</b> {com.comment}
                </li>
              ))}
            </ul>
            <button onClick={() => document.getElementById("commentModal").close() || setCommentModal(null)}>Close</button>
          </>
        )}
      </dialog>

      {/* View Modal */}
      <dialog id="viewModal">
        {viewModal && (
          <>
            <h3>Details for {viewModal.companyname}</h3>
            <p>Client: {viewModal.clientname}</p>
            <p>Product: {viewModal.productname || "--"}</p>
            <p>Assigned KAM: {viewModal.kam_name || "Not Assigned"}</p>
            <p>Telecaller: {viewModal.telecaller_name || "Not Assigned"}</p>
            <p>Stage: {viewModal.status || "--"}</p>
            <p>Banks: {viewModal?.bank_assignments?.map((element, idx) => (
              <span key={idx}>{element.bank_name} -- {element.status}{idx < viewModal.bank_assignments.length - 1 ? ", " : ""}</span>
            )) || "--"}</p>
            <button onClick={() => document.getElementById("viewModal").close() || setViewModal(null)}>Close</button>
          </>
        )}
      </dialog>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DashboardOverviewOptimized;
