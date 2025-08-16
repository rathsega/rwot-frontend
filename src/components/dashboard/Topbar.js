// components/dashboard/Topbar.js
import React from "react";
import { FaRegBell } from "react-icons/fa";

export default function Topbar() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "18px 40px 0 0",
      background: "transparent",
      height: 60,
    }}>
      <span style={{ marginRight: 24, color: "#181B2A", fontWeight: 500 }}>Status: <span style={{ color: "#24D97A" }}>Online</span></span>
      <FaRegBell size={22} style={{ marginRight: 18, color: "#5F677A" }} />
      <img src="/rwot-logo.svg" alt="RWOT Logo" height={30} />
    </div>
  );
}