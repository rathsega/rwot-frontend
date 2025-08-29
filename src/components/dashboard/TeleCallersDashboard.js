import React, { useEffect, useState } from "react";
import { FaUserEdit, FaPlus, FaTimes, FaRegCommentDots } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import apiFetch from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TelecallersDashboard() {
  const { token } = useAuth() || {};
  const [cases, setCases] = useState([]);
  const [kamUsers, setKamUsers] = useState([]);
  const [modal, setModal] = useState({ open: false, caseData: null });
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState("");
  const [commentsModal, setCommentsModal] = useState({ open: false, caseid: null });
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetchCases();
    fetchKamUsers();
  }, []);

  const fetchCases = async () => {
    const res = await apiFetch("/cases", { credentials: "include" });
    const data = await res;
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
    const url = modal.caseData ? `/cases/edit/${modal.caseData.caseid}` : "/cases"; // Use new clean endpoint

    let res, status;
    try {
      res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      status = res.status || res.statusCode || 200; // fallback to 200 if not present
    } catch (err) {
      toast.error("Network error. Failed to save case.");
      return;
    }

    if (status === 200) {
      await fetchCases();
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
        <div style={{ flexGrow: 1 }}></div>
        <button
          onClick={() => handleModalOpen()}
          style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 600 }}
        >
          <FaPlus style={{ marginRight: 8 }} /> Add Lead
        </button>
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
            {cases.map((c, i) => (
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
                <td style={{ textAlign: "left", padding: 12 }}>{c.location}</td>
                <td style={{ textAlign: "left", padding: 12 }}>{new Date(c.date).toLocaleDateString()}</td>
                <td style={{ textAlign: "left", padding: 12 }}>{c.status}</td>
                <td style={{ textAlign: "left", padding: 12 }}>
                  {
                    kamUsers.find((u) => u.id === Number(c.kamAssignee))?.name ||
                    c.assigned_to_name ||
                    c.assignedkamname ||
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

      {/* Modal */}
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
                  <label style={{ fontWeight: 600 }}>{label} {required.includes(key) && <span style={{ color: "#e53935" }}>*</span>}</label>
                  <input
                    type={key === "date" ? "date" : key === "time" ? "time" : "text"}
                    value={form[key] || ""}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={styles.input}
                  />
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

      {/* Comments Modal */}
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