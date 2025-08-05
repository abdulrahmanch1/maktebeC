import React, { createContext, useMemo, useContext, useCallback } from "react";
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
  const { isLoggedIn, user, token, setUser } = useContext(AuthContext); // Get authentication status, user data, and token from AuthContext

  const favorites = useMemo(() => user?.favorites || [], [user]);

  // Callback function to toggle a book's favorite status
  const toggleFavorite = useCallback(async (bookId) => {
    if (!isLoggedIn || !user || !user._id || !token) { // Check if user is logged in
      toast.error("يجب تسجيل الدخول لإضافة الكتاب للمفضلة.");
      return;
    }

    try {
      let updatedFavorites;
      if (favorites.includes(bookId)) {
        // If book is already a favorite, remove it
        const res = await axios.delete(`${API_URL}/api/users/${user._id}/favorites/${bookId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        updatedFavorites = res.data.favorites; // Get updated favorites from response
        toast.success("تمت إزالة الكتاب من المفضلة.");
      } else {
        // If book is not a favorite, add it
        const res = await axios.post(`${API_URL}/api/users/${user._id}/favorites`, { bookId }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        updatedFavorites = res.data.favorites; // Get updated favorites from response
        toast.success("تمت إضافة الكتاب إلى المفضلة.");
      }
      setUser({ ...user, favorites: updatedFavorites }); // Update user context with new favorites
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error(error.response?.data?.message || "فشل تحديث المفضلة."); // Display error message
    }
  }, [favorites, isLoggedIn, user, token, setUser]); // Dependencies for useCallback

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
