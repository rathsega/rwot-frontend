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

  // Centralized filter state
  const [filters, setFilters] = useState({
    status: "",
    time: "",
    assignee: "",
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
      
      if (filters.status && filters.status !== "Cold") {
        params.set("status", filters.status);
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
      if (filters.status === "Cold") {
        fetchedCases = fetchedCases.filter((c) =>
          c.status_updated_on &&
          dayjs().diff(dayjs(c.status_updated_on), "hour") > coldCaseThresholdHours
        );
      }

      // Assignee filter (client-side since we need nested data)
      if (filters.assignee) {
        fetchedCases = fetchedCases.filter((c) => {
          const kamName = c.kam_name || "";
          const telecallerName = c.telecaller_name || "";
          return kamName.toLowerCase() === filters.assignee.toLowerCase() ||
                 telecallerName.toLowerCase() === filters.assignee.toLowerCase();
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
      setFilters(prev => ({ ...prev, status: status }));
    }
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

  const handleDateChange = (dateType, value) => {
    setFilters(prev => ({ ...prev, [dateType]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: "",
      time: "",
      assignee: "",
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

          <label>
            Stage:
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All</option>
              <option value="Open">Open</option>
              <option value="Meeting Done">Meeting Done</option>
              <option value="Documentation Initiated">Documentation Initiated</option>
              <option value="Documentation In Progress">Documentation In Progress</option>
              <option value="Underwriting">Underwriting</option>
              <option value="One Pager">One Pager</option>
              <option value="Banker Review">Banker Review</option>
              <option value="Disbursement">Disbursement</option>
              <option value="Done">Done</option>
              <option value="No Requirement">No Requirement</option>
              <option value="Cold">Cold</option>
            </select>
          </label>

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

          <label>
            Assignee:
            <select
              className="filter-select"
              value={filters.assignee}
              onChange={(e) => handleFilterChange("assignee", e.target.value)}
            >
              <option value="">All</option>
              {assigneeOptions.map((a, idx) => (
                <option key={idx} value={a.name}>
                  {a.name} - {a.role}
                </option>
              ))}
            </select>
          </label>

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
