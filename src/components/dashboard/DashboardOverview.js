import React, { useEffect, useState } from "react";
import { FaPlus, FaEye, FaRegCommentDots, FaSearch } from "react-icons/fa";
import "./dashboard-theme.css";
import apiFetch from "../../utils/api";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useColdCaseThreshold } from "../../hooks/useSettings";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);

const DashboardOverview = () => {
  const { coldCaseThresholdHours } = useColdCaseThreshold();
  const [cases, setCases] = useState([]);
  const [originalCases, setOriginalCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  // ✅ Centralized filter state with custom date support
  const [filters, setFilters] = useState({
    status: "",
    time: "",
    assignee: "",
    search: "",
    dateFrom: "",
    dateTo: ""
  });

  // get query param for status filter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status) {
      setFilters(prev => ({ ...prev, status: status }));
    }
  }, []);

  useEffect(() => {
    apiFetch("/cases", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        setCases(res.cases || res);
        setOriginalCases(res.cases || res);
      })
      .catch((err) => console.error(err));
  }, []);

  // ✅ Apply all filters whenever filters state changes
  useEffect(() => {
    applyAllFilters();
  }, [filters, originalCases]);

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

  // ✅ Get date range based on filter type
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
        // Indian Financial Year: April 1 to March 31
        const fyStart = now.month() >= 3 
          ? now.month(3).startOf('month') 
          : now.subtract(1, 'year').month(3).startOf('month');
        const fyEnd = now.month() >= 3 
          ? now.add(1, 'year').month(2).endOf('month') 
          : now.month(2).endOf('month');
        return { start: fyStart, end: fyEnd };
      
      case "Last Financial Year":
        // Previous Indian Financial Year
        const lastFyStart = now.month() >= 3 
          ? now.subtract(1, 'year').month(3).startOf('month') 
          : now.subtract(2, 'year').month(3).startOf('month');
        const lastFyEnd = now.month() >= 3 
          ? now.month(2).endOf('month') 
          : now.subtract(1, 'year').month(2).endOf('month');
        return { start: lastFyStart, end: lastFyEnd };
      
      case "Custom":
        if (filters.dateFrom && filters.dateTo) {
          return { 
            start: dayjs(filters.dateFrom).startOf('day'), 
            end: dayjs(filters.dateTo).endOf('day') 
          };
        } else if (filters.dateFrom) {
          return { 
            start: dayjs(filters.dateFrom).startOf('day'), 
            end: now.endOf('day') 
          };
        } else if (filters.dateTo) {
          return { 
            start: dayjs('1900-01-01'), 
            end: dayjs(filters.dateTo).endOf('day') 
          };
        }
        return null;
      
      default:
        return null;
    }
  };

  // ✅ Apply all active filters simultaneously
  const applyAllFilters = () => {
    let filtered = [...originalCases];

    // Apply search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((c) => {
        const bankNames = c?.bank_assignments?.map(ba => ba.bank_name).join(" ").toLowerCase() || "";
        const kamName = c.assignments?.find(a => a.assigned_to_role === "KAM")?.assigned_to_name?.toLowerCase() || "";
        const telecallerName = c.assignments?.find(a => a.assigned_to_role === "Telecaller")?.assigned_to_name?.toLowerCase() || "";
        return (
          (c.companyname || "").toLowerCase().includes(searchLower) ||
          (c.clientname || "").toLowerCase().includes(searchLower) ||
          (c.productname || "").toLowerCase().includes(searchLower) ||
          kamName.includes(searchLower) ||
          telecallerName.includes(searchLower) ||
          (c.status || "").toLowerCase().includes(searchLower) ||
          bankNames.includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (filters.status && filters?.status !== "Cold") {
      filtered = filtered.filter((c) =>
        (c.status || "--").toLowerCase() === filters.status.toLowerCase()
      );
    }

    if(filters?.status === "Cold"){
      filtered = filtered.filter((c) =>
        c.status_updated_on &&
        dayjs().diff(dayjs(c.status_updated_on), "hour") > coldCaseThresholdHours
      );  
    }

    // ✅ Apply time filter with custom date support
    if (filters.time) {
      const dateRange = getDateRange(filters.time);
      if (dateRange) {
        filtered = filtered.filter((c) => {
          const caseDate = dayjs(c.createddate);
          return caseDate.isBetween(dateRange.start, dateRange.end, null, '[]');
        });
      }
    }

    // Apply assignee filter
    if (filters.assignee) {
      filtered = filtered.filter((c) =>
        (c.assignments || []).some(
          (a) =>
            `${a.assigned_to_name}`.toLowerCase() ===
            filters.assignee.toLowerCase()
        )
      );
    }

    setCases(filtered);
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setFilters(prev => ({ ...prev, search: searchValue }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const updated = { ...prev, [filterType]: value };
      // Clear custom dates when switching away from Custom
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

  // ✅ Clear all filters function
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
    setCases(originalCases);
  };

  const handleUserInput = (e) =>
    setUserForm({ ...userForm, [e.target.name]: e.target.value });

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (userForm.password.length !== 10) {
      alert("Password must be exactly 10 characters.");
      return;
    }
    // Check for duplicate email
    try {
      const checkRes = await apiFetch(`/users/check-email?email=${userForm.email}`, {
        method: "GET",
        credentials: "include",
      });
      const checkData = await checkRes;
      if (checkData.exists) {
        alert("Email already exists. Please use a different one.");
        return;
      }
    } catch (err) {
      console.error("Email check failed", err);
    }

    // Proceed to create
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

          {/* ✅ Time Filter with Custom Option */}
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

          {/* ✅ Custom Date Range Inputs */}
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
              {Array.from(
                new Map(
                  originalCases
                    .flatMap((c) => c.assignments || [])
                    .map((a) => [a.assigned_to_name, a])
                ).values()
              ).map((a, idx) => (
                <option key={idx} value={a.assigned_to_name}>
                  {a.assigned_to_name} - {a.assigned_to_role}
                </option>
              ))}
            </select>
          </label>

          {/* ✅ Clear Filters Button */}
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
      <div>
        Showing {cases.length} of {originalCases.length} cases
      </div>

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
            <tr key={i}>
              <td>{c.companyname || "--"}</td>
              <td>{(() => {
                const kamAssignment = c.assignments?.find(assignment =>
                  assignment.assigned_to_role === "KAM"
                );
                return kamAssignment ? kamAssignment.assigned_to_name : "--";
              })()}</td>
              <td>{(() => {
                const telecallerAssignment = c.assignments?.find(assignment =>
                  assignment.assigned_to_role === "Telecaller"
                );
                return telecallerAssignment ? telecallerAssignment.assigned_to_name : "--";
              })()}</td>
              <td>{c?.meeting_done_date || "--"}</td>
              <td>{c.status || "--"}</td>
              <td>{c?.bank_assignments?.map(element => (
                <p key={element.id}>{element.bank_name} - {element.status}</p>
              ))}</td>
              <td>
                <FaRegCommentDots
                  style={{ cursor: "pointer" }}
                  onClick={() => document.getElementById("commentModal").showModal() || setCommentModal(c)}
                />
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
            <p>Assigned KAM: {(() => {
              const kamAssignment = viewModal.assignments?.find(a => a.assigned_to_role === "KAM");
              return kamAssignment ? `${kamAssignment.assigned_to_name} (${kamAssignment.assigned_to_email})` : "Not Assigned";
            })()}</p>
            <p>Stage: {viewModal.status || "--"}</p>
            <p>Bank: {viewModal?.bank_assignments?.map(element => (
              <span key={element.id}>{element.bank_name} -- {element.status}</span>
            ))}</p>
            <button onClick={() => document.getElementById("viewModal").close() || setViewModal(null)}>Close</button>
          </>
        )}
      </dialog>
    </div>
  );
};

export default DashboardOverview;