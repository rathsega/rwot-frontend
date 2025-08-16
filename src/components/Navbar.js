import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import logoDark from "../Assets/logo.png";
import logoLight from "../Assets/logo-light.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BsRocketTakeoffFill, BsPersonCircle } from "react-icons/bs";
import { useBackground } from "../context/BackgroundContext";
import { useAuth } from "../context/AuthContext";

function NavBar() {
  const [expand, updateExpanded] = useState(false);
  const [navColour, updateNavbar] = useState(false);
  const { bgMode } = useBackground();
  const { user, logout } = useAuth(); // ✅ Auth context
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const scrollHandler = () => {
      updateNavbar(window.scrollY >= 20);
    };
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  // 🚨 Auto logout if user navigates away from dashboard
  useEffect(() => {
    if (user && !location.pathname.includes("/dashboard")) {
      logout(); // auto-logout when leaving dashboard
    }
  }, [location.pathname]);

  const getNavbarClass = () => {
    if (navColour) {
      if (bgMode === "dark") return "navbar-dark sticky";
      if (bgMode === "light") return "navbar-light sticky";
      return "navbar-transparent sticky";
    } else {
      if (bgMode === "dark") return "navbar-dark";
      if (bgMode === "light") return "navbar-light";
      return "navbar-transparent";
    }
  };

  const getTextColorClass = () => {
    if (bgMode === "dark") return "text-white";
    if (bgMode === "light") return "text-dark";
    return "text-white";
  };

  const logoSrc = bgMode === "dark" || bgMode === "transparent" ? logoLight : logoDark;

  return (
    <Navbar expanded={expand} fixed="top" expand="md" className={getNavbarClass()}>
      <Container fluid>
        <Navbar.Brand href="/" className="d-flex">
          <img src={logoSrc} className="img-fluid logo" alt="brand" />
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={() => updateExpanded(expand ? false : "expanded")}
        />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className={`ms-auto ${getTextColorClass()}`} defaultActiveKey="#home">
            <Nav.Item><Nav.Link as={Link} to="/" onClick={() => updateExpanded(false)}>Home</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link as={Link} to="/about" onClick={() => updateExpanded(false)}>Alliancing with RWOT!</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link as={Link} to="/industries" onClick={() => updateExpanded(false)}>Industries</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link as={Link} to="/services" onClick={() => updateExpanded(false)}>Services</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link as={Link} to="/testimonials" onClick={() => updateExpanded(false)}>Testimonials</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link as={Link} to="/contact" onClick={() => updateExpanded(false)}>Contact</Nav.Link></Nav.Item>

            {/* 🔁 Raised link styled like nav item */}
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/register"
                onClick={() => updateExpanded(false)}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                Raise <BsRocketTakeoffFill />
              </Nav.Link>
            </Nav.Item>

            {/* 👤 User dashboard icon */}
            {user && (
              <Nav.Item>
                <Nav.Link
                  as={Link}
                  to="/dashboard"
                  onClick={() => updateExpanded(false)}
                  title="My Dashboard"
                >
                  <BsPersonCircle size={22} />
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;