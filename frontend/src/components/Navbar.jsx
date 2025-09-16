import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";
import logo from "../assets/github-mark-white.svg";
import { useAuth } from "../authContext";
import { SearchIcon, PlusIcon } from "@primer/octicons-react";

const Navbar = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    setCurrentUser(null);
    navigate("/auth");
  };

  const isActiveRoute = (path) => location.pathname === path;

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      {/* Brand Logo */}
      <Link to="/" className="nav-left">
        <div className="brand">
          <img src={logo} alt="GitHub Logo" className="login-logo" />
          <h3>Codehub</h3>
        </div>
      </Link>

      {/* Search Bar */}
      <div className="nav-center">
        <div className="search-container">
          <SearchIcon size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search repositories..."
            className="search-input"
            onFocus={() => navigate("/dashboard")}
          />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="nav-right">
       <Link
  to="/dashboard"
  className={`nav-link ${isActiveRoute("/dashboard") ? "active" : ""}`}
>
  Dashboard
</Link>

        <Link
          to="/create"
          className={`nav-link ${isActiveRoute("/create") ? "active" : ""}`}
        >
          <PlusIcon size={16} />
          <span>Create</span>
        </Link>

        <Link
          to="/explore"
          className={`nav-link ${isActiveRoute("/explore") ? "active" : ""}`}
        >
          Explore
        </Link>

        {/* User Menu */}
        {currentUser ? (
          <div className="user-menu" ref={menuRef}>
            <button
  className="user-button"
  onClick={() => setMenuOpen(!menuOpen)}
  aria-expanded={menuOpen}
  aria-label="User menu"
>
  {currentUser.profilePicture ? (
    <img
      src={`https://codehub.duckdns.org${currentUser.profilePicture}`}
      alt="Profile"
      className="avatar"
    />
  ) : (
    <div className="avatar-placeholder">
      {currentUser.username?.charAt(0).toUpperCase() || "U"}
    </div>
  )}
  <span className="username">{currentUser.username}</span>
</button>

            {menuOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item">
                  Your profile
                </Link>
                <Link to="/settings" className="dropdown-item">
                Update Profile
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item">
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="nav-link">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
