import React from "react";
import { Link } from "react-router-dom";
import "./nab_bar.css";
import logo from "/logo.png";

const NavBar = () => {
  return (
    <>
      <nav className="navbar-container">

        {/* Logo Section */}
        <div className="navbar-brand">
          <a href="#about" className="navbar-link">
            <img src={logo} alt="Logo" className="navbar-logo-icon" onMouseOver={(e) => e.target.style.transform = "scale(1.1)"} onMouseOut={(e) => e.target.style.transform = "scale(1)"} />
          </a>
          <span className="navbar-title">Prototype Builder</span>

        </div>

        {/* Navigation Links & Actions */}
        <div className="navbar-menu">
          <a href="#about" className="navbar-link">About</a>
          <a href="#features" className="navbar-link">Features</a>
          <a href="#workflow" className="navbar-link">Workflow</a>
          <a href="#architecture" className="navbar-link">Architecture</a>

          <div className="navbar-actions">
            <Link to="/login">
              <button className="navbar-btn-primary">
                Sign In/Sign Up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Divider */}
      <hr className="navbar-divider" />
    </>
  );
};

export default NavBar;