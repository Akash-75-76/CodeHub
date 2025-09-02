import React, { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";

// Pages List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/SignUp";
import CreateRepository from "./components/user/CreateRepository";
// Auth Context
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");
    const tokenFromStorage = localStorage.getItem("token");

    if (userIdFromStorage && tokenFromStorage && !currentUser) {
      setCurrentUser(userIdFromStorage);
    }

    if ((!userIdFromStorage || !tokenFromStorage) && !["/auth", "/signup"].includes(window.location.pathname)) {
      navigate("/auth");
    }

    if (userIdFromStorage && tokenFromStorage && window.location.pathname === "/auth") {
      navigate("/");
    }
  }, [currentUser, navigate, setCurrentUser]);

  let element = useRoutes([
    {
      path: "/",
      element: currentUser ? <Dashboard /> : <Login />,
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
      element: currentUser ? <Profile /> : <Login />,
    },
    {
        path:"/create",
        element: currentUser ? <CreateRepository/> : <Login />
    }
  ]);

  return element;
};

export default ProjectRoutes;
