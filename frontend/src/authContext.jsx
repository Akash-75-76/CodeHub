import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setCurrentUser({ id: userId });
    }
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("userId", currentUser.id);
    } else {
      localStorage.removeItem("userId");
    }
  }, [currentUser]);

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem("userId", user.id);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("userId");
  };

  const value = {
    currentUser,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
