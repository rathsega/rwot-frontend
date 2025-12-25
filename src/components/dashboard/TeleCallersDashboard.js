import React, { useEffect, useState } from "react";
import { FaUserEdit, FaPlus, FaTimes, FaRegCommentDots } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import apiFetch from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch } from "react-icons/fa";
import dayjs from "dayjs";

export default function TelecallersDashboard() {
  const { token } = useAuth() || {};
  const [cases, setCases] = useState([]);
  const [kamUsers, setKamUsers] = useState([]);
  const [modal, setModal] = useState({ open: false, caseData: null });
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState("");
  const [commentsModal, setCommentsModal] = useState({ open: false, caseid: null });
  const [commentText, setCommentText] = useState("");
  const [originalCases, setOriginalCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Separate state for each filter
  const [filters, setFilters] = useState({
    status: "",
    time: "",
    assignee: "",
    search: ""
  });

  const styles = {
    modalOverlay: {
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(38, 47, 73, 0.25)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000
    },
    modal: {
      background: "#fff",
      padding: 24,
      borderRadius: 16,
      boxShadow: "0 8px 42px 0 rgba(18,38,63,0.17)",
      minWidth: 420,
      maxWidth: 820,
      maxHeight: "90vh"
    },
    input: {
      width: "100%",
      padding: "9px 13px",
      border: "1px solid #dadada",
      borderRadius: 8,
      fontSize: 15,
      background: "#f8fafd",
      fontWeight: 500,
      outline: "none"
    }
  };

  useEffect(() => {
    fetchCases();
    fetchKamUsers();
  }, []);

  // ✅ Apply all filters whenever filters state changes
  useEffect(() => {
    applyAllFilters();
  }, [filters, originalCases]);

  const applyAllFilters = () => {
    let filtered = [...originalCases];

    // Apply search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((c) => {
        const bankNames = c?.bank_assignments?.map(ba => ba.bank_name).join(" ").toLowerCase() || "";
        return (
          (c.companyname || "").toLowerCase().includes(searchLower) ||
          (c.clientname || "").toLowerCase().includes(searchLower) ||
          (c.productname || "").toLowerCase().includes(searchLower) ||
          (c.assigned_to_name || c.assignee || "").toLowerCase().includes(searchLower) ||
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
                dayjs().diff(dayjs(c.status_updated_on), "hour") > 48
      );  
    }

    // Apply time filter
    if (filters.time) {
      const now = new Date();
      switch (filters.time) {
        case "Today":
          filtered = filtered.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            return updatedAt.toDateString() === now.toDateString();
          });
          break;
        case "Yesterday":
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          filtered = filtered.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            return updatedAt.toDateString() === yesterday.toDateString();
          });
          break;
        case "Last 7 Days":
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          filtered = filtered.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            return updatedAt >= sevenDaysAgo;
          });
          break;
        case "Last 30 Days":
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          filtered = filtered.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            return updatedAt >= thirtyDaysAgo;
          });
          break;
        case "This Week":
          const firstDayOfWeek = new Date(now);
          firstDayOfWeek.setDate(now.getDate() - now.getDay());
          filtered = filtered.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            return updatedAt >= firstDayOfWeek;
          });
          break;
        case "This Month":
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = filtered.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            return updatedAt >= firstDayOfMonth;
          });
          break;
        case "This Year":
          const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
          filtered = filtered.filter((c) => {
            const updatedAt = new Date(c.updatedat || c.updatedAt);
            return updatedAt >= firstDayOfYear;
          });
          break;
        default:
          break;
      }
    }

    // Apply assignee filter
    if (filters.assignee) {
      filtered = filtered.filter((c) =>
        (c.assigned_to_name || c.assignee || "").toLowerCase() === filters.assignee.toLowerCase()
      );
    }

    setCases(filtered);
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setFilters(prev => ({ ...prev, search: searchValue }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: "",
      time: "",
      assignee: "",
      search: ""
    });
    setSearchTerm("");
    setCases(originalCases);

    // Reset select elements
    const selects = document.querySelectorAll(".filter-select");
    selects.forEach(select => select.value = "");
  };

  const fetchCases = async () => {
    const res = await apiFetch("/cases", { credentials: "include" });
    const data = await res;
    setOriginalCases(data.cases || []);
    setCases(data.cases || []);
  };

  const fetchKamUsers = async () => {
    const res = await apiFetch("/users/role/KAM", { credentials: "include" });
    const data = await res;
    setKamUsers(data.users || []);
  };

  const handleModalOpen = (c = null) => {
    setModal({ open: true, caseData: c });
    setForm(
      c
        ? {
          companyname: c.companyname,
          clientname: c.clientname,
          phonenumber: c.phonenumber,
          leadsource: c.leadsource || (c.createdby === null ? "Website" : ""),
          turnover: c.turnover || "",
          turnoverType: ["1-5cr", "5-25cr", "25-50cr", "50-100cr", "100+ cr"].includes(c.turnover)
            ? c.turnover : c.turnover ? "Others" : "",
          location: c.location || "",
          spocemail: c.spocemail || "",
          spocname: c.spocname || "",
          spocphonenumber: c.spocphonenumber || "",
          date: c.date,
          time: c.time,
          comments: Array.isArray(c.comments) && c.comments.length > 0 ? c.comments[c.comments.length - 1].text : "",
          assignedKam: c.kamAssignee || c.assignedKam || c.assignedkam || c.assigned_to || ""
        }
        : {
          companyname: "",
          clientname: "",
          phonenumber: "",
          leadsource: "",
          turnover: "",
          location: "",
          spocemail: "",
          spocname: "",
          spocphonenumber: "",
          date: "",
          time: "",
          comments: "",
          assignedKam: ""
        }
    );
    setFormError("");
  };

  const required = ["companyname", "clientname", "phonenumber", "date", "time", "assignedKam"];

  const handleSave = async () => {
    const missing = required.filter((k) => {
      const v = form[k];
      if (typeof v === 'string') return !v.trim();
      return !v;
    });
    if (missing.length > 0) {
      setFormError("Missing: " + missing.join(", "));
      return;
    }
    if (form.phonenumber && !/^\d{10}$/.test(form.phonenumber.trim())) {
      setFormError("Phone number must be 10 digits.");
      return;
    }
    if (form.time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(form.time.trim())) {
      setFormError("Time must be in HH:MM format (e.g., 14:30).");
      return;
    }
    const payload = {
      caseid: modal.caseData?.caseid || `CASE${Date.now()}`,
      companyname: form.companyname,
      clientname: form.clientname,
      phonenumber: form.phonenumber,
      leadsource: form.leadsource,
      turnover: form.turnover,
      location: form.location,
      spocemail: form.spocemail,
      spocname: form.spocname,
      spocphonenumber: form.spocphonenumber,
      date: form.date,
      time: form.time,
      role: "Telecaller",
      status: "Open",
      comments: form.comments,
      kamAssignee: form.assignedKam
    };

    const method = modal.caseData ? "PUT" : "POST";
    const url = modal.caseData ? `/cases/edit/${modal.caseData.caseid}` : "/cases";

    let res, status;
    try {
      res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      status = res.status || res.statusCode || 200;
    } catch (err) {
      toast.error("Network error. Failed to save case.");
      return;
    }

    if (status === 200) {
      await fetchCases();
      await fetchKamUsers();
      setModal({ open: false, caseData: null });
      toast.success(method === "POST" ? "Case created successfully" : "Case updated successfully");
    } else {
      toast.error(method === "POST" ? "Failed to create case." : "Failed to update case.");
    }
  };

  const handleCommentSend = async () => {
    if (!commentText.trim()) return;
    await apiFetch("/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        caseid: commentsModal.caseid,
        comment: commentText
      })
    });
    setCommentText("");
    setCommentsModal({ open: false, caseid: null });
    await fetchCases();
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Telecaller Dashboard</h2>
        <button
          onClick={() => handleModalOpen()}
          style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 600 }}
        >
          <FaPlus style={{ marginRight: 8 }} /> Add Lead
        </button>
      </div>

      <div className="dashboard-filters" style={{ display: "flex", gap: "10px" }}>
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
            name="stage"
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
            <option value="No Requirement">No Requirement</option>
            <option value="Cold">Cold</option>
          </select>
        </label>

        <label>
          Time:
          <select
            className="filter-select"
            name="time"
            value={filters.time}
            onChange={(e) => handleFilterChange("time", e.target.value)}
          >
            <option value="">All</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>
        </label>

        <label>
          Assignee:
          <select
            className="filter-select"
            value={filters.assignee}
            onChange={(e) => handleFilterChange("assignee", e.target.value)}
          >
            <option value="">All</option>
            {Array.from(new Set(originalCases.map((c) => c.assigned_to_name || c.assignee).filter(Boolean))).map((name, idx) => (
              <option key={idx} value={name}>{name}</option>
            ))}
          </select>
        </label>

        <div>
          <button
            onClick={clearAllFilters}
            style={{ background: "#463939ff", color: "white", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}
          >
            Clear Filters
          </button>
        </div>
      </div>
      <div>
        Showing {cases.length} of {originalCases.length} cases
      </div>

      {/* Table */}
      <div style={{ marginTop: 24, borderRadius: 12, background: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f1f4f9", fontWeight: 600 }}>
            <tr>
              <th style={{ textAlign: "left", padding: "12px" }}></th>
              <th style={{ textAlign: "left", padding: "12px" }}>Company</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Client</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Mobile</th>
              <th style={{ textAlign: "left", padding: "12px", minWidth: 120 }}>Lead Source</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Turnover</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Location</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Date</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Status</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Assigned KAM</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Comments</th>
            </tr>
          </thead>
          <tbody>
            {cases?.map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee", fontWeight: 500 }}>
                <td style={{ textAlign: "left", padding: 14 }}>
                  <button onClick={() => handleModalOpen(c)} style={{ border: "none", background: "none", color: "#2979ff", cursor: "pointer" }}>
                    <FaUserEdit />
                  </button>
                </td>
                <td style={{ textAlign: "left", padding: 12 }}>{c.companyname}</td>
                <td style={{ textAlign: "left", padding: 12 }}>{c.clientname}</td>
                <td style={{ textAlign: "left", padding: 12 }}>{c.phonenumber}</td>
                <td style={{ textAlign: "left", padding: 12 }}>{c.leadsource}</td>
                <td style={{ textAlign: "left", padding: 12 }}>{c.turnover}</td>
                <td style={{ textAlign: "left", padding: 12 }}>
                  {c.location && c.location.startsWith('http') ? (
                    <a href={c.location} target="_blank" rel="noopener noreferrer">View</a>
                  ) : (
                    c.location || "--"
                  )}
                </td>
                <td style={{ textAlign: "left", padding: 12 }}>{new Date(c.date).toLocaleDateString()}</td>
                <td style={{ textAlign: "left", padding: 12 }}>{c.status}</td>
                <td style={{ textAlign: "left", padding: 12 }}>
                  {
                    kamUsers.find((u) => u.id === Number(c.assignedKam))?.name ||
                    "--"
                  }
                </td>
                <td style={{ textAlign: "left", padding: 12 }}>
                  <button
                    onClick={() => setCommentsModal({ open: true, caseid: c.caseid })}
                    style={{ border: "none", background: "none", color: "#2979ff", cursor: "pointer" }}
                  >
                    <FaRegCommentDots /> {Array.isArray(c.comments) ? c.comments.length : 0}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal code remains the same... */}
      {modal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700 }}>Add/Edit Lead</h3>
              <button onClick={() => setModal({ open: false, caseData: null })} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#555" }}>
                <FaTimes />
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {[
                ["Company Name", "companyname"],
                ["Client Name", "clientname"],
                ["Mobile", "phonenumber"],
                ["Lead Source", "leadsource"],
                ["Turnover", "turnover"],
                ["Location", "location"],
                ["SPOC Name", "spocname"],
                ["SPOC Email", "spocemail"],
                ["SPOC Phone", "spocphonenumber"],
                ["Date", "date"],
                ["Time", "time"],
                ["Comments", "comments"]
              ].map(([label, key]) => (
                <div key={key} style={{ flex: "1 1 44%" }}>
                  <label style={{ fontWeight: 600 }}>
                    {label} {required.includes(key) && <span style={{ color: "#e53935" }}>*</span>}
                  </label>
                  {key === "time" ? (
                    <select
                      value={form[key] || ""}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={styles.input}
                    >
                      <option value="">Select Time</option>
                      {Array.from({ length: 48 }, (_, i) => {
                        const hours = Math.floor(i / 2);
                        const minutes = (i % 2) * 30;
                        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        return (
                          <option key={timeString} value={timeString}>
                            {timeString}
                          </option>
                        );
                      })}
                    </select>
                  ) : key === "turnover" ? (
                    <div>
                      <select
                        value={form.turnoverType || ""}
                        onChange={e => {
                          setForm(f => ({
                            ...f,
                            turnoverType: e.target.value,
                            turnover: e.target.value === "Others" ? "" : e.target.value
                          }));
                        }}
                        style={styles.input}
                      >
                        <option value="">Select Turnover Range</option>
                        <option value="1-5cr">1-5 Cr</option>
                        <option value="5-25cr">5-25 Cr</option>
                        <option value="25-50cr">25-50 Cr</option>
                        <option value="50-100cr">50-100 Cr</option>
                        <option value="100+ cr">100+ Cr</option>
                        <option value="Others">Others</option>
                      </select>
                      {form.turnoverType === "Others" && (
                        <input
                          type="text"
                          value={form.turnover || ""}
                          onChange={e => setForm(f => ({ ...f, turnover: e.target.value }))}
                          style={{ ...styles.input, marginTop: 8 }}
                          placeholder="Enter custom turnover amount"
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type={key === "date" ? "date" : "text"}
                      value={form[key] || ""}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={styles.input}
                    />
                  )}
                </div>
              ))}

              <div style={{ flex: "1 1 44%" }}>
                <label style={{ fontWeight: 600 }}>Assign KAM</label>
                <select
                  value={form.assignedKam || ""}
                  onChange={(e) => setForm({ ...form, assignedKam: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Select KAM</option>
                  {kamUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            </div>

            {formError && <div style={{ color: "#e53935", marginTop: 10 }}>{formError}</div>}
            <div style={{ textAlign: "right", marginTop: 16 }}>
              <button onClick={handleSave} style={{ background: "#2979ff", color: "#fff", borderRadius: 8, padding: "9px 24px", fontWeight: 600, border: "none" }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {commentsModal.open && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, minWidth: 420 }}>
            <h3 style={{ marginBottom: 10 }}>Comments</h3>
            <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 12 }}>
              {cases.find(c => c.caseid === commentsModal.caseid)?.comments?.map((cm, i) => (
                <div key={i} style={{ background: "#f8fafd", padding: 10, borderRadius: 6, marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, color: "#2979ff" }}>{cm.commentby}</div>
                  <div>{cm.comment}</div>
                  <div style={{ fontSize: 12, color: "#000" }}>
                    {cm.created_at ? new Date(cm.created_at).toLocaleString() : "--"}
                  </div>
                </div>
              )) || <div>No comments</div>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add comment..."
                style={styles.input}
              />

            </div>
            <div style={{ textAlign: "right", marginTop: 12, justifyContent: "space-between" }}>
              <button
                onClick={handleCommentSend}
                style={{ background: "#2979ff", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 600 }}
              >Send</button>
              <button onClick={() => setCommentsModal({ open: false, caseid: null })} style={{ background: "#fff", color: "#000", border: "1px solid #ccc", padding: "6px 18px", borderRadius: 6 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick />
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(38, 47, 73, 0.25)", display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000
  },
  modal: {
    background: "#fff", padding: 24, borderRadius: 16,
    boxShadow: "0 8px 42px 0 rgba(18,38,63,0.17)", minWidth: 420, maxWidth: 820
  },
  input: {
    width: "100%", padding: "9px 13px", border: "1px solid #dadada", borderRadius: 8,
    fontSize: 15, background: "#f8fafd", fontWeight: 500, outline: "none"
  }
};