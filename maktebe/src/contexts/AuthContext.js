import React, { createContext, useState, useMemo, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { API_URL } from "../constants";

export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  // State for user authentication status, user data, and authentication token
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));

  // Effect to fetch user data when token changes (e.g., on initial load or refresh)
  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          logout();
          return;
        }
        try {
          const userObject = JSON.parse(storedUser);
          const response = await axios.get(`${API_URL}/api/users/${userObject._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data);
          setIsLoggedIn(true);
          localStorage.setItem("user", JSON.stringify(response.data));
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          logout(); // Logout if fetching user data fails (e.g., token expired)
        }
      }
    };
    fetchUserData();
  }, [token]);

  // Effect to set default Authorization header for Axios and handle token expiration
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken && storedToken !== "") {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error("Error setting axios default header from localStorage:", error);
    }

    // Add a response interceptor to handle 401/403 errors (e.g., token expiration)
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403 || (error.response.data && error.response.data.message === 'TokenExpiredError: jwt expired'))) {
          logout(); // Call logout function on unauthorized/forbidden or expired token
        }
        return Promise.reject(error);
      }
    );

    // Cleanup function to eject the interceptor when component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Function to handle user login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/login`, { email, password });
      const { user: userData, token: userToken } = response.data; // Correctly extract user and token from response

      // Update state and local storage with new user data and token
      setIsLoggedIn(true);
      setUser(userData);
      setToken(userToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userToken);
      
      // Set default Authorization header for all subsequent Axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

      toast.success("تم تسجيل الدخول بنجاح!");
      return true; // Indicate success
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.message || "فشل تسجيل الدخول.");
      return false; // Indicate failure
    }
  };

  // Function to handle user logout
  const logout = () => {
    // Reset state and remove data from local storage
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Remove default Authorization header for Axios
    delete axios.defaults.headers.common['Authorization'];
  };

  // Memoized context value to prevent unnecessary re-renders
  const authContextValue = useMemo(
    () => ({
      isLoggedIn,
      user,
      token,
      login,
      logout,
      setUser, // Expose setUser for direct updates (e.g., profile picture)
    }),
    [isLoggedIn, user, token]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

