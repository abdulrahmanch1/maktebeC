import React, { createContext, useState, useMemo, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const FavoritesContext = createContext({
  favorites: [],
  toggleFavorite: (bookId) => {},
  isFavorite: (bookId) => false,
});

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem("favorites");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const { isLoggedIn, user, token } = useContext(AuthContext); // Get token from AuthContext

  // Fetch favorites when user logs in or changes
  useEffect(() => {
    const fetchFavorites = async () => {
      if (isLoggedIn && user && user._id && token) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${user._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setFavorites(response.data.favorites || []);
        } catch (error) {
          console.error("Failed to fetch favorites:", error);
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    };

    fetchFavorites();
  }, [isLoggedIn, user, token]);

  const toggleFavorite = useCallback(async (bookId) => { // Wrapped in useCallback
    if (!isLoggedIn || !user || !user._id || !token) {
      alert("Please log in to add books to your favorites.");
      return;
    }

    

    try {
      if (favorites.includes(bookId)) {
        // Remove from favorites
        const res = await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${user._id}/favorites/${bookId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavorites(res.data.favorites || favorites.filter((id) => id !== bookId));
        localStorage.setItem("favorites", JSON.stringify(res.data.favorites || favorites.filter((id) => id !== bookId)));
      } else {
        // Add to favorites
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/${user._id}/favorites`, { bookId }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavorites(res.data.favorites || [...favorites, bookId]);
        localStorage.setItem("favorites", JSON.stringify(res.data.favorites || [...favorites, bookId]));
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      alert("Failed to update favorites. Please try again.");
    }
  }, [favorites, isLoggedIn, user, token]); // Added dependencies for useCallback

  const isFavorite = useCallback((bookId) => { // Wrapped in useCallback
    return favorites.includes(bookId);
  }, [favorites]); // Added dependencies for useCallback

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
