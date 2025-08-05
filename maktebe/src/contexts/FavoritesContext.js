import React, { createContext, useState, useMemo, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { toast } from 'react-toastify';
import { API_URL } from "../constants";

export const FavoritesContext = createContext({
  favorites: [],
  toggleFavorite: (bookId) => {},
  isFavorite: (bookId) => false,
});

export const FavoritesProvider = ({ children }) => {
  // State to store the user's favorite books, initialized from local storage
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem("favorites");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      // If parsing fails, return an empty array
      return [];
    }
  });
  const { isLoggedIn, user, token } = useContext(AuthContext); // Get authentication status, user data, and token from AuthContext

  // Effect to fetch favorites from the backend when user logs in or changes
  useEffect(() => {
    const fetchFavorites = async () => {
      if (isLoggedIn && user && user._id && token) { // Only fetch if user is logged in and has an ID and token
        try {
          const response = await axios.get(`${API_URL}/api/users/${user._id}`, {
            headers: {
              Authorization: `Bearer ${token}`, // Send authorization token
            },
          });
          setFavorites(response.data.favorites || []); // Update favorites state with fetched data
        } catch (error) {
          console.error("Failed to fetch favorites:", error);
          setFavorites([]); // Clear favorites on error
          toast.error(error.response?.data?.message || "فشل جلب المفضلة."); // Display error message
        }
      } else {
        setFavorites([]); // Clear favorites if user is not logged in
      }
    };

    fetchFavorites();
  }, [isLoggedIn, user, token]); // Re-run effect when these dependencies change

  // Callback function to toggle a book's favorite status
  const toggleFavorite = useCallback(async (bookId) => { 
    if (!isLoggedIn || !user || !user._id || !token) { // Check if user is logged in
      toast.error("يجب تسجيل الدخول لإضافة الكتاب للمفضلة.");
      return;
    }

    try {
      if (favorites.includes(bookId)) {
        // If book is already a favorite, remove it
        const res = await axios.delete(`${API_URL}/api/users/${user._id}/favorites/${bookId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavorites(res.data.favorites || favorites.filter((id) => id !== bookId)); // Update favorites state
        localStorage.setItem("favorites", JSON.stringify(res.data.favorites || favorites.filter((id) => id !== bookId))); // Update local storage
        toast.success("تمت إزالة الكتاب من المفضلة.");
      } else {
        // If book is not a favorite, add it
        const res = await axios.post(`${API_URL}/api/users/${user._id}/favorites`, { bookId }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavorites(res.data.favorites);
        localStorage.setItem("favorites", JSON.stringify(res.data.favorites));
        toast.success("تمت إضافة الكتاب إلى المفضلة.");
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error(error.response?.data?.message || "فشل تحديث المفضلة."); // Display error message
    }
  }, [favorites, isLoggedIn, user, token]); // Dependencies for useCallback

  // Callback function to check if a book is a favorite
  const isFavorite = useCallback((bookId) => { 
    return favorites.includes(bookId);
  }, [favorites]); // Dependencies for useCallback

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite,
    }),
    [favorites, toggleFavorite, isFavorite]
  );

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};
