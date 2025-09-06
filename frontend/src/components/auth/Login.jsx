import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";

import { PageHeader, Box, Button } from "@primer/react";
import "./login.css";

import logo from "../../assets/github-mark-white.svg";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Clear any existing auth data on component mount
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://3.90.56.59:3000/api/users/login", {
        email: email,
        password: password,
      });

      // Fetch complete user data including followers/following
      try {
        const userRes = await axios.get(
          `http://3.90.56.59:3000/api/users/${res.data.userId}`,
          {
            headers: {
              Authorization: `Bearer ${res.data.token}`,
            },
          }
        );
        
        // Use the auth context login method
        login(userRes.data, res.data.token, res.data.userId);
        setLoading(false);
        navigate("/");
      } catch (userErr) {
        console.error("Error fetching user details:", userErr);
        // Fallback: login with basic data if user details fetch fails
        login({ _id: res.data.userId, email }, res.data.token, res.data.userId);
        setLoading(false);
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || 
        "Login failed! Please check your credentials and try again."
      );
      setLoading(false);
    }
  };

  // Show loading state if auth is still initializing
  if (authLoading) {
    return (
      <div className="login-wrapper">
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh",
          color: "white"
        }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="login-logo-container">
        <img className="logo-login" src={logo} alt="Logo" />
      </div>

      <div className="login-box-wrapper">
        <div className="login-heading">
  <h1>Sign in to GitHub</h1>
</div>
        
        {error && (
          <div className="error-message" style={{ 
            color: "#cf222e", 
            backgroundColor: "#ffebe9", 
            padding: "10px", 
            borderRadius: "6px", 
            margin: "10px 0",
            border: "1px solid #ff8182"
          }}>
            {error}
          </div>
        )}
        
        <div className="login-box">
          <div>
            <label className="label">Email address</label>
            <input
              autoComplete="email"
              name="Email"
              id="Email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>
          <div className="div">
            <label className="label">Password</label>
            <input
              autoComplete="current-password"
              name="Password"
              id="Password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <Button
            variant="primary"
            className="login-btn"
            disabled={loading}
            onClick={handleLogin}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          {/* Forgot password link */}
         <div style={{ textAlign: "center", marginTop: "1rem" }}>
  <Link 
    to="/forgot-password" 
    style={{ 
      color: "#58a6ff", 
      fontSize: "12px",
      textDecoration: "none"
    }}
  >
    Forgot password?
  </Link>
</div>
        </div>
        <div className="pass-box">
          <p>
            New to GitHub? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;