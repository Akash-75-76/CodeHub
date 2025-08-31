import { useEffect } from "react";
import { useNavigate, useRoutes, useLocation } from "react-router-dom";

//pages list
import Dashboard from "./components/dashboard/Dashboard";
import Login from "./components/auth/Login";
import Profile from "./components/profile/Profile";
import Signup from "./components/auth/Signup";

//Auth Context
import { useAuth } from "./context/AuthContext";

const ProjectRoutes = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");

    if (userIdFromStorage && !currentUser) {
      setCurrentUser({ id: userIdFromStorage });
    }

    if (!userIdFromStorage && !["/auth", "/signup"].includes(location.pathname)) {
      navigate("/auth");
    }

    if (userIdFromStorage && location.pathname === "/auth") {
      navigate("/dashboard");
    }
  }, [currentUser, navigate, setCurrentUser, location.pathname]);

  let element = useRoutes([
    { path: "/auth", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/profile", element: <Profile /> },
  ]);

  return element;
};

export default ProjectRoutes;
