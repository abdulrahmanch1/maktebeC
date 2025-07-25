
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { FavoritesContext } from "../contexts/FavoritesContext";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";

const BookDetailsPage = () => {
  const { theme } = useContext(ThemeContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const { isLoggedIn } = useContext(AuthContext);
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/books/${id}`);
        setBook(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError("الكتاب غير موجود أو حدث خطأ أثناء جلبه.");
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [id]);

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      alert("يجب تسجيل الدخول لإضافة الكتاب للمفضلة.");
      return;
    }
    toggleFavorite(book._id);
  };

  if (loading) {
    return <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px", textAlign: "center" }}>جاري تحميل تفاصيل الكتاب...</div>;
  }

  if (error) {
    return <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px", textAlign: "center", }}>{error}</div>;
  }

  if (!book) {
    return <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px", textAlign: "center" }}>الكتاب غير موجود</div>;
  }

  const isLiked = isFavorite(book._id);

  return (
    <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "40px 20px", display: "flex", flexDirection: "row-reverse", justifyContent: "center", alignItems: "flex-start", gap: "40px", flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 300px", maxWidth: "400px" }}>
        <img
          src={`${process.env.REACT_APP_API_URL}/uploads/${book.cover}`}
          alt={book.title}
          style={{ width: "100%", height: "auto", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" }}
        />
      </div>
      <div style={{ flex: "2 1 500px", maxWidth: "600px", textAlign: "right" }}>
        <h1 style={{ color: theme.primary, borderBottom: `2px solid ${theme.accent}`, paddingBottom: "10px" }}>{book.title}</h1>
        <p style={{ fontSize: "1.3em", marginTop: "20px" }}><strong>المؤلف:</strong> <span style={{ color: theme.accent }}>{book.author}</span></p>
        <p style={{ fontSize: "1.2em" }}><strong>التصنيف:</strong> {book.category}</p>
        <p style={{ fontSize: "1.2em" }}><strong>سنة النشر:</strong> {book.publishYear}</p>
        <p style={{ fontSize: "1.2em" }}><strong>عدد الصفحات:</strong> {book.pages}</p>
        <p style={{ fontSize: "1.2em" }}><strong>اللغة:</strong> {book.language}</p>
        <h2 style={{ color: theme.primary, marginTop: "30px", borderTop: `1px solid ${theme.secondary}`, paddingTop: "20px" }}>الوصف:</h2>
        <p style={{ fontSize: "1.1em", lineHeight: "1.8" }}>{book.description}</p>

        {book.pdfFile && (
          <button
            onClick={() => window.open(`${process.env.REACT_APP_API_URL}/uploads/${book.pdfFile}`, '_blank')}
            style={{
              backgroundColor: theme.accent,
              color: theme.primary,
              padding: "12px 24px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              marginTop: "30px",
              fontSize: "1.1em",
              fontWeight: "bold",
              width: "100%",
              transition: "background-color 0.3s ease",
            }}
          >
            قراءة الكتاب (PDF)
          </button>
        )}

        <button
          onClick={handleToggleFavorite}
          style={{
            backgroundColor: isLiked ? theme.secondary : theme.accent,
            color: isLiked ? theme.background : theme.primary,
            padding: "12px 24px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            marginTop: "10px",
            fontSize: "1.1em",
            fontWeight: "bold",
            width: "100%",
            transition: "background-color 0.3s ease",
          }}
        >
          {isLiked ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        </button>
      </div>
    </div>
  );
};

export default BookDetailsPage;
