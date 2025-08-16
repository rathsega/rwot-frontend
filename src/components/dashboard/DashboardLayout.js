import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw",
      overflow: "hidden", // Prevents overall double scroll
      background: "#F8FAFD"
    }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onNav={navigate}
        activeRoute={location.pathname}
      />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#F8FAFD",
          overflow: "auto", // Scroll main area only
          minWidth: 0,      // For flexbox overflow fixes
        }}
      >
        {/* Optional Topbar can go here */}

        {/* Main content area */}
        <div style={{
          flex: 1,
          padding: "32px 40px 0 40px",
          minHeight: 0, // Needed for flex scroll
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}