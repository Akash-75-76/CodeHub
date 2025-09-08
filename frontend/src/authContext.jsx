import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token")); // ✅ keep token in state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userData = localStorage.getItem("userData");

      if (storedToken && userId) {
        setToken(storedToken); // ✅ set token

        try {
          if (userData) {
            setCurrentUser(JSON.parse(userData));
          }

          const response = await fetch(`https://codehub.duckdns.org/api/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const freshUserData = await response.json();
            setCurrentUser(freshUserData);
            localStorage.setItem("userData", JSON.stringify(freshUserData));
          } else {
            clearAuthData();
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          if (!userData) clearAuthData();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    setCurrentUser(null);
    setToken(null); // ✅ clear token
  };

  const updateUser = (userData) => {
    setCurrentUser(userData);
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      localStorage.removeItem("userData");
    }
  };

  const refreshUserData = async () => {
    if (!token || !currentUser?._id) return null;

    try {
      const response = await fetch(`https://codehub.duckdns.org/api/users/${currentUser._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const freshUserData = await response.json();
        setCurrentUser(freshUserData);
        localStorage.setItem("userData", JSON.stringify(freshUserData));
        return freshUserData;
      } else {
        clearAuthData();
        return null;
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };

  const login = (userData, newToken, userId) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userData", JSON.stringify(userData));
    setCurrentUser(userData);
    setToken(newToken); // ✅ store token
  };

  const logout = () => {
    clearAuthData();
  };

  const isAuthenticated = () => {
    return !!currentUser && !!token;
  };

  const value = {
    currentUser,
    token, // ✅ make available
    setCurrentUser: updateUser,
    login,
    logout,
    refreshUserData,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
