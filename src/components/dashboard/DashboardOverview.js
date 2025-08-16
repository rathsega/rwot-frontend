import React, { useEffect, useState } from "react";
import { FaPlus, FaEye, FaRegCommentDots } from "react-icons/fa";
import "./dashboard-theme.css";
import apiFetch from "../../utils/api";

const DashboardOverview = () => {
  const [cases, setCases] = useState([]);
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

  useEffect(() => {
    apiFetch("/cases", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => setCases(res.cases || res))
      .catch((err) => console.error(err));
  }, []);

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
        <div className="dashboard-filters" style={{ display: "flex", gap: "10px" }}>
          <label>
            Status:
            <select className="filter-select" onChange={(e) =>
              setCases((prev) =>
                prev.filter((c) =>
                  e.target.value === ""
                    ? true
                    : (c.status || "--").toLowerCase() === e.target.value.toLowerCase()
                )
              )
            }>
              <option value="">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </label>

          <label>
            Stage:
            <select className="filter-select" onChange={(e) =>
              setCases((prev) =>
                prev.filter((c) =>
                  e.target.value === ""
                    ? true
                    : (c.stage || "--").toLowerCase() === e.target.value.toLowerCase()
                )
              )
            }>
              <option value="">All</option>
              <option value="Documentation">Documentation</option>
              <option value="Underwriting">Underwriting</option>
              <option value="Banker Review">Banker Review</option>
              <option value="Completed">Completed</option>
            </select>
          </label>

          <label>
            Assignee:
            <select className="filter-select" onChange={(e) =>
              setCases((prev) =>
                prev.filter((c) =>
                  e.target.value === ""
                    ? true
                    : (c.assigned_to_name || c.assignee || "").toLowerCase() === e.target.value.toLowerCase()
                )
              )
            }>
              <option value="">All</option>
              {Array.from(new Set(cases.map((c) => c.assigned_to_name || c.assignee).filter(Boolean))).map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>

        <button className="add-user-btn" onClick={() => document.getElementById("addUserModal").showModal()}>
          <FaPlus /> Add User
        </button>
      </div>

      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Client</th>
            <th>Product</th>
            <th>Assignee</th>
            <th>Status</th>
            <th>Stage</th>
            <th>Bank</th>
            {/* <th>Updated</th> */}
            <th>Comments</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c, i) => (
            <tr key={i}>
              <td>{c.companyname || "--"}</td>
              <td>{c.clientname || "--"}</td>
              <td>{c.productname || "--"}</td>
              <td>{c.assigned_to_name || c.assignee || "--"}</td>
              <td>{c.status || "--"}</td>
              <td>{c.stage || "--"}</td>
              <td>{c.bank?.name || c.banker?.bankName || c.bankName || c.banker?.name || c.bankname || "--"}</td>
              {/* <td>{new Date(c.updatedat || c.updatedAt).toLocaleString()}</td> */}
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
            <p>Assignee: {viewModal.assigned_to_name || viewModal.assignee || "--"}</p>
            <p>Status: {viewModal.status || "--"}</p>
            <p>Stage: {viewModal.stage || "--"}</p>
            <p>Bank: {viewModal.bank?.name || viewModal.banker?.bankName || viewModal.bankName || viewModal.banker?.name || viewModal.bankname || "--"}</p>
            <button onClick={() => document.getElementById("viewModal").close() || setViewModal(null)}>Close</button>
          </>
        )}
      </dialog>
    </div>
  );
};

export default DashboardOverview;