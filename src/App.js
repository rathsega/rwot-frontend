import React, { useState, useEffect } from "react";
import Preloader from "../src/components/Pre";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./style.css";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Contact from "./components/Contact/Contact";
import Register from "./components/Register/Register";
import Industries from "./components/Industries/Industries";
import TestimonialCarousel from "./components/Testimonials/Testimonials";
import Services from "./components/Services/Services";
import UnderwriterDashboard from "./components/dashboard/UnderwriterDashboard";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import OverviewDashboard from "./components/dashboard/DashboardOverview";
import OperationsDashboard from "./components/dashboard/OperationsDashboard";
import TelecallersDashboard from "./components/dashboard/TeleCallersDashboard";
import KamDashboard from "./components/dashboard/KAMDashboard";
import UserDashboard from "./components/dashboard/UserDashboard";
import Profile from "./components/dashboard/profile";
import BankerDashboard from "./components/dashboard/BankerDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ element: Element, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return null; // or show loading spinner
  if (!user) return <Navigate to="/register" replace />;
  if (!allowedRoles.includes(user.rolename)) return <Navigate to="/dashboard/profile" replace />;
  return <Element />;
}

function useRedirectAfterLogin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && location.pathname === "/register") {
      const roleToPath = {
        Admin: "/dashboard",
        UW: "/dashboard/underwriter",
        Operations: "/dashboard/operations",
        Telecaller: "/dashboard/telecallers",
        KAM: "/dashboard/kam",
        Banker: "/dashboard/banker",
        Individual: "/dashboard/client",
      };
      const targetPath = roleToPath[user.rolename] || "/dashboard";
      navigate(targetPath, { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);
}

function AppContent() {
  const [load, upadateLoad] = useState(true);
  const location = useLocation();

  // 👇 Auto-redirect after login based on role
  useRedirectAfterLogin();

  useEffect(() => {
    const timer = setTimeout(() => {
      upadateLoad(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const hideNavbar = location.pathname.startsWith("/dashboard");

  return (
    <>
      <Preloader load={load} />
      <div className="App" id={load ? "no-scroll" : "scroll"}>
        {!hideNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/about" element={<About />} />
          <Route path="/testimonials" element={<TestimonialCarousel />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />

          {/* DASHBOARD ROUTES */}
          <Route path="/dashboard/*" element={<DashboardLayout />}>
            <Route index element={<ProtectedRoute element={OverviewDashboard} allowedRoles={["Admin"]} />} />
            <Route path="underwriter" element={<ProtectedRoute element={UnderwriterDashboard} allowedRoles={["Admin", "UW"]} />} />
            <Route path="operations" element={<ProtectedRoute element={OperationsDashboard} allowedRoles={["Admin", "Operations"]} />} />
            <Route path="telecallers" element={<ProtectedRoute element={TelecallersDashboard} allowedRoles={["Admin", "Telecaller"]} />} />
            <Route path="kam" element={<ProtectedRoute element={KamDashboard} allowedRoles={["Admin", "KAM"]} />} />
            <Route path="banker" element={<ProtectedRoute element={BankerDashboard} allowedRoles={["Admin", "Banker"]} />} />
            <Route path="client" element={<ProtectedRoute element={UserDashboard} allowedRoles={["Individual"]} />} />
            <Route path="profile" element={<ProtectedRoute element={Profile} allowedRoles={["Admin", "UW", "Operations", "Telecaller", "KAM", "Banker", "Individual"]} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        
      </Router>
    </AuthProvider>
  );
}

export default App;