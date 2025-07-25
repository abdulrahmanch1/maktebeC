
import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { FavoritesContext } from "../contexts/FavoritesContext";
import BookCard from "../components/BookCard";
import axios from "axios";

const FavoritesPage = () => {
  const { theme } = useContext(ThemeContext);
  const { favorites } = useContext(FavoritesContext);
  const [favoriteBooksData, setFavoriteBooksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavoriteBookDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const responses = await Promise.all(
          favorites.map((id) => axios.get(`${process.env.REACT_APP_API_URL}/api/books/${id}`))
        );
        const fetchedBooks = responses.map((res) => res.data);
        setFavoriteBooksData(fetchedBooks);
      } catch (err) {
        console.error("Failed to fetch favorite book details:", err);
        setError("Failed to load favorite books.");
      } finally {
        setLoading(false);
      }
    };

    if (favorites.length > 0) {
      fetchFavoriteBookDetails();
    } else {
      setFavoriteBooksData([]);
      setLoading(false);
    }
  }, [favorites]);

  if (loading) {
    return <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px", textAlign: "center" }}>جاري تحميل الكتب المفضلة...</div>;
  }

  if (error) {
    return <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px", textAlign: "center" }}>{error}</div>;
  }

  return (
    <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px" }}>
      <h1 style={{ color: theme.primary, textAlign: "center" }}>الكتب المفضلة</h1>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {favoriteBooksData.length > 0 ? (
          favoriteBooksData.map((book) => (
            <BookCard key={book._id} book={book} />
          ))
        ) : (
          <p style={{ textAlign: "center", width: "100%" }}>لم تقم بإضافة أي كتب إلى المفضلة بعد.</p>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
