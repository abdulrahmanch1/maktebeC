import React, { createContext, useState, useMemo, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));

  

  // Set default Authorization header for axios on initial load
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken && storedToken !== "") {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error("Error setting axios default header from localStorage:", error);
    }

    // Add a response interceptor
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403 || (error.response.data && error.response.data.message === 'TokenExpiredError: jwt expired'))) {
          console.log("Token expired or unauthorized, logging out...");
          logout(); // Call logout function
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, { email, password });
      const { user: userData, token: userToken } = response.data; // Correctly extract user and token

      setIsLoggedIn(true);
      setUser(userData);
      setToken(userToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userToken);
      localStorage.setItem("favorites", JSON.stringify(userData.favorites || []));
      // Set default Authorization header for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("favorites");
    // Remove default Authorization header for axios
    delete axios.defaults.headers.common['Authorization'];
  };

  const authContextValue = useMemo(
    () => ({
      isLoggedIn,
      user,
      token,
      login,
      logout,
    }),
    [isLoggedIn, user, token]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

