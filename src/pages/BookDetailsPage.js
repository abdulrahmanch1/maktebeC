
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { FavoritesContext } from "../contexts/FavoritesContext";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";

const BookDetailsPage = () => {
  const { theme } = useContext(ThemeContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const { isLoggedIn, user, token, setUser } = useContext(AuthContext); // Get user and token
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInReadingList, setIsInReadingList] = useState(false);
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/books/${id}`);
        setBook(response.data);
        setLoading(false);

        // Check if book is in reading list
        if (user && user.readingList) {
          const item = user.readingList.find(item => item.book === id);
          if (item) {
            setIsInReadingList(true);
            setIsRead(item.read);
          }
        }
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError("الكتاب غير موجود أو حدث خطأ أثناء جلبه.");
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [id, user]); // Add user to dependency array

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      alert("يجب تسجيل الدخول لإضافة الكتاب للمفضلة.");
      return;
    }
    toggleFavorite(book._id);
  };

  const handleAddToReadingList = async () => {
    if (!isLoggedIn) {
      alert("يجب تسجيل الدخول لإضافة الكتاب إلى قائمة القراءة.");
      return;
    }
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/${user._id}/reading-list`, { bookId: book._id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, readingList: res.data }); // Update user context
      setIsInReadingList(true);
      setIsRead(false); // Newly added book is not read
      alert("تمت إضافة الكتاب إلى قائمة القراءة.");
      window.open(`${process.env.REACT_APP_API_URL}/uploads/${book.pdfFile}`, '_blank'); // Open PDF after adding to reading list
    } catch (err) {
      console.error("Error adding to reading list:", err);
      alert(err.response?.data?.message || "فشل إضافة الكتاب إلى قائمة القراءة.");
    }
  };

  

  const handleToggleReadStatus = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await axios.patch(`${process.env.REACT_APP_API_URL}/api/users/${user._id}/reading-list/${book._id}`, { read: !isRead }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, readingList: res.data }); // Update user context
      setIsRead(!isRead);
      alert(`تم وضع علامة على الكتاب كـ ${!isRead ? "مقروء" : "غير مقروء"}.`);
    } catch (err) {
      console.error("Error toggling read status:", err);
      alert("فشل تحديث حالة الكتاب.");
    }
  };

  const handleRemoveFromReadingList = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${user._id}/reading-list/${book._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, readingList: res.data }); // Update user context
      setIsInReadingList(false);
      setIsRead(false);
      alert("تمت إزالة الكتاب من قائمة القراءة.");
    } catch (err) {
      console.error("Error removing from reading list:", err);
      alert("فشل إزالة الكتاب من قائمة القراءة.");
    }
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

        

        {!isInReadingList && (
          <button
            onClick={handleAddToReadingList}
            style={{
              backgroundColor: theme.accent,
              color: theme.primary,
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
            اقرأ الكتاب
          </button>
        )}

        {isInReadingList && (
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={handleToggleReadStatus}
              style={{
                backgroundColor: isRead ? theme.secondary : theme.accent,
                color: isRead ? theme.background : theme.primary,
                padding: "12px 24px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                fontSize: "1.1em",
                fontWeight: "bold",
                flex: 1,
                transition: "background-color 0.3s ease",
              }}
            >
              {isRead ? "وضع علامة كغير مقروء" : "وضع علامة كمقروء"}
            </button>
            <button
              onClick={handleRemoveFromReadingList}
              style={{
                backgroundColor: "#dc3545", // Red color for remove
                color: "white",
                padding: "12px 24px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                fontSize: "1.1em",
                fontWeight: "bold",
                flex: 1,
                transition: "background-color 0.3s ease",
              }}
            >
              إزالة من قائمة القراءة
            </button>
          </div>
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
