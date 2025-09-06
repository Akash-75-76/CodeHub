import React, { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";

// Pages List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/SignUp";
import CreateRepository from "./components/user/CreateRepository";
import Explore from "./components/repo/Explore";
// Auth Context
import { useAuth } from "./authContext";
import Update from "./components/user/Update";

const ProjectRoutes = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect logic based on authentication status
    if (!loading) {
      const isAuthPage = ["/auth", "/signup"].includes(
        window.location.pathname
      );

      if (!isAuthenticated() && !isAuthPage) {
        navigate("/auth");
      } else if (isAuthenticated() && isAuthPage) {
        navigate("/");
      }
    }
  }, [currentUser, loading, isAuthenticated, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#0d1117",
          color: "white",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  let element = useRoutes([
    {
      path: "/",
      element: isAuthenticated() ? <Dashboard /> : <Login />,
    },
    {
      path: "/auth",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/profile",
      element: isAuthenticated() ? <Profile /> : <Login />,
    },
    {
      path: "/profile/:userId",
      element: isAuthenticated() ? <Profile /> : <Login />,
    },
    {
      path: "/create",
      element: isAuthenticated() ? <CreateRepository /> : <Login />,
    },
    {
      path: "/dashboard",
      element: isAuthenticated() ? <Dashboard /> : <Login />,
    },
    {
      path: "/repo",
      element: isAuthenticated() ? <div>Starred Repositories</div> : <Login />,
    },
    {
      path: "/explore",
      element: isAuthenticated() ? <Explore /> : <Login />,
    },
    {
      path:"/settings",
      element: isAuthenticated() ? <Update/> : <Login />,
    },

    // Add a catch-all route for 404 pages
    {
      path: "*",
      element: (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "white",
            backgroundColor: "#0d1117",
            minHeight: "100vh",
          }}
        >
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#238636",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Go Home
          </button>
        </div>
      ),
    },
  ]);

  return element;
};

export default ProjectRoutes;
