import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";

import { PageHeader, Box, Button } from "@primer/react";
import "./auth.css";

import logo from "../../assets/github-mark-white.svg";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !username || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://3.90.56.59:3000/api/users/signup", {
        email: email,
        password: password,
        username: username,
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
        login({ _id: res.data.userId, username, email }, res.data.token, res.data.userId);
        setLoading(false);
        navigate("/");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message || 
        "Signup failed! The username or email might already be taken. Please try different credentials."
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
  <h1>Create your account</h1>
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
            <label className="label">Username</label>
            <input
              autoComplete="username"
              name="Username"
              id="Username"
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Choose a username"
              minLength={3}
              maxLength={20}
            />
          </div>

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
              autoComplete="new-password"
              name="Password"
              id="Password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Create a password (min. 6 characters)"
              minLength={6}
            />
          </div>

          <div className="div">
            <label className="label">Confirm Password</label>
            <input
              autoComplete="new-password"
              name="ConfirmPassword"
              id="ConfirmPassword"
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              placeholder="Confirm your password"
              minLength={6}
            />
          </div>

          <Button
            variant="primary"
            className="login-btn"
            disabled={loading}
            onClick={handleSignup}
          >
            {loading ? "Creating account..." : "Sign up"}
          </Button>

          <div className="terms-box">
  <p style={{ margin: 0, color: "#7d8590" }}>
    By creating an account, you agree to our <Link to="/terms" style={{ color: "#58a6ff" }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: "#58a6ff" }}>Privacy Policy</Link>.
  </p>
</div>
        </div>

        <div className="pass-box">
          <p>
            Already have an account? <Link to="/auth">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;