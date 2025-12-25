import {
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
  FaTachometerAlt,
  FaUserTie,
  FaUsers,
  FaUserCog,
  FaUserCheck,
  FaIdBadge,
  FaRegUser,
  FaSignOutAlt
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export const navLinks = [
  { key: "dashboard", label: "Dashboard", icon: <FaTachometerAlt />, route: "/dashboard/dashboard" },
  { key: "users-dashboard", label: "Users Dashboard", icon: <FaTachometerAlt />, route: "/dashboard/users-dashboard" },
  { key: "overview", label: "Overview", icon: <FaTachometerAlt />, route: "/dashboard/overview" },
  { key: "underwriting", label: "Underwriting", icon: <FaUserTie />, route: "/dashboard/underwriting" },
  { key: "operations", label: "Operations", icon: <FaUserCog />, route: "/dashboard/operations" },
  { key: "telecallers", label: "Telecallers", icon: <FaUsers />, route: "/dashboard/telecallers" },
  { key: "kam", label: "KAM", icon: <FaUserCheck />, route: "/dashboard/kam" },
  { key: "client", label: "User Dashboard", icon: <FaRegUser />, route: "/dashboard/client" },
  { key: "banker", label: "Banker Dashboard", icon: <FaRegUser />, route: "/dashboard/banker" },
  { key: "profile", label: "Profile Details", icon: <FaIdBadge />, route: "/dashboard/profile" },
  { key: "manage-banks", label: "Manage Banks", icon: <FaUserCog />, route: "/dashboard/manage-banks" },
  { key: "user-management", label: "User Management", icon: <FaUsers />, route: "/dashboard/usermanagement" }
];

const roleKeyMap = {
  Admin: ["dashboard", "users-dashboard", "overview", "underwriting", "operations", "telecallers", "kam", "banker", "profile", "manage-banks", "user-management"],
  UW: ["underwriting", "profile"],
  Operations: ["operations", "profile", "dashboard", "manage-banks"],
  Telecaller: ["telecallers", "profile", "dashboard"],
  KAM: ["kam", "profile", "dashboard"],
  Banker: ["banker", "profile"],
  Individual: ["client", "profile"]
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getFilteredLinks = () => {
    if (!user) return [];
    const role = user.rolename;
    const allowedKeys = roleKeyMap[role] || [];
    return navLinks.filter(link => allowedKeys.includes(link.key));
  };

  return (
    <div
      style={{
        width: collapsed ? 80 : 230,
        background: "#181B2A",
        color: "#fff",
        minHeight: "100vh",
        transition: "width 0.3s",
        boxShadow: "2px 0 12px #0001",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 10
      }}
    >
      {/* Collapse/Expand Toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          position: "absolute",
          top: 16,
          right: collapsed ? -24 : -16,
          width: 32,
          height: 32,
          background: "#23243B",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          boxShadow: "0 1px 4px #0002",
          cursor: "pointer",
          zIndex: 11
        }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/* Avatar & App name */}
      <div style={{ textAlign: "center", marginTop: 40, marginBottom: collapsed ? 18 : 24 }}>
        <FaUserCircle size={collapsed ? 32 : 52} style={{ marginBottom: 6 }} />
        {!collapsed && (
          <>
            <div style={{ fontSize: 14, color: "#C2C2D1" }}>RWOT</div>
          </>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        {getFilteredLinks().map(link => (
          <SidebarLink
            key={link.key}
            to={link.route}
            icon={link.icon}
            collapsed={collapsed}
            label={link.label}
            active={location.pathname === link.route}
            navigate={navigate}
          />
        ))}
      </nav>

      {/* Logout */}
      <div style={{ margin: "18px 0", marginTop: "auto" }}>
        <SidebarLink
          to="/logout"
          icon={<FaSignOutAlt />}
          collapsed={collapsed}
          label="Logout"
          navigate={navigate}
        />
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label, collapsed, active, navigate }) {
  return (
    <div
      onClick={() => navigate(to)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        background: active ? "#23243B" : "none",
        color: active ? "#fff" : "#C2C2D1",
        padding: collapsed ? "12px 12px" : "12px 20px",
        borderRadius: 8,
        margin: "4px 10px",
        fontWeight: active ? 700 : 500,
        fontSize: 15,
        transition: "background 0.2s, color 0.2s"
      }}
      tabIndex={0}
      role="button"
      aria-label={label}
    >
      <span style={{ fontSize: 19 }}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </div>
  );
}