// CaseCommentsModal.js
import React, { useState } from "react";

export default function CaseCommentsModal({ comments = [], onClose, onSend, loading }) {
  const [input, setInput] = useState("");

  // Send comment
  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(38,47,73,0.15)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 18,
        minWidth: 370,
        maxWidth: 520,
        padding: "32px 30px 20px 30px",
        boxShadow: "0 8px 32px 0 rgba(18,38,63,0.16)",
        fontFamily: '"Inter", "SF Pro Display", Arial, sans-serif',
        maxHeight: "82vh",
        overflow: "auto"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <div style={{ flex: 1, fontWeight: 700, fontSize: 21, textAlign: "center" }}>
            Case Comments
          </div>
          <button
            style={{
              background: "none", border: "none", fontSize: 24,
              color: "#888", cursor: "pointer", marginLeft: 10
            }}
            onClick={onClose}
          >×</button>
        </div>
        {/* Comments */}
        <div style={{ marginBottom: 12, maxHeight: "48vh", overflowY: "auto" }}>
          {comments.length === 0 ? (
            <div style={{
              color: "#bbb", margin: "32px 0", fontSize: 17,
              textAlign: "center"
            }}>No comments yet.</div>
          ) : (
            comments.map((comm, idx) => (
              <div key={idx}
                style={{
                  background: "#f7f9fe",
                  borderRadius: 15,
                  marginBottom: 15,
                  padding: "17px 15px 11px 15px",
                  boxShadow: "0 1px 4px #f1f1fa",
                  textAlign: "center"
                }}>
                <div style={{ color: "#2979ff", fontWeight: 800, fontSize: 17, marginBottom: 5 }}>
                  {comm.by}
                </div>
                <div style={{ color: "#23243b", fontWeight: 500, fontSize: 16, marginBottom: 6 }}>
                  {comm.text}
                </div>
                <div style={{ color: "#868c9c", fontWeight: 600, fontSize: 14 }}>
                  {comm.date ? new Date(comm.date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Input Bar */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Type your comment…"
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{
              flex: 1,
              border: "1.5px solid #e3e7f1",
              borderRadius: 10,
              fontSize: 16,
              padding: "10px 15px",
              outline: "none",
              fontWeight: 500,
              background: "#fafbfc"
            }}
            onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              background: "#2979ff",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: 16,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer"
            }}
          >Send</button>
        </div>
      </div>
    </div>
  );
}