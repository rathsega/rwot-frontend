import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import "./SideNav.css";

const SideNav = ({ show, onClose }) => {
  return (
    <div className={`sidenav-overlay${show ? " show" : ""}`}> 
      <nav className={`sidenav${show ? " open" : ""}`} aria-label="Sidebar Navigation">
        <button className="sidenav-close" onClick={onClose} aria-label="Close sidebar">
          <FaTimes />
        </button>
        <div className="sidenav-scroll">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">Alliancing with RWOT!</Link></li>
            <li><Link to="/industries">Industries</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/testimonials">Testimonials</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/register">Raise</Link></li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default SideNav;
