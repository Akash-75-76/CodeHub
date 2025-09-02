import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import logo from "../assets/github-mark-white.svg";
import { useAuth } from "../authContext";

const Navbar = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/auth");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-left">
        <div className="brand">
          <img src={logo} alt="GitHub Logo" className="login-logo" />
          <h3>Convohub</h3>
        </div>
      </Link>

      <div className="nav-right">
        <Link to="/create">
          <p>Create a Repository</p>
        </Link>
        <Link to="/profile">
          <p>Profile</p>
        </Link>

        {currentUser && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
