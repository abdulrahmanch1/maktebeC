
import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import BookCard from "../components/BookCard";
import { Link } from "react-router-dom"; // Import Link

const ReadingListPage = () => {
  const { theme } = useContext(ThemeContext);
  const { user, isLoggedIn, token } = useContext(AuthContext);
  const [showReadBooks, setShowReadBooks] = useState(true);
  const [readingListBooks, setReadingListBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReadingList = async () => {
      if (!isLoggedIn || !user || !user._id || !token) {
        setReadingListBooks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userReadingList = response.data.readingList || [];

        // Fetch details for each book in the reading list
        const bookDetailsPromises = userReadingList.map(async (item) => {
          try {
            const bookResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/books/${item.book}`);
            return { ...bookResponse.data, read: item.read };
          } catch (bookError) {
            console.error(`Error fetching book ${item.book}:`, bookError);
            return null; // Return null for books that failed to fetch
          }
        });

        const fetchedBooks = (await Promise.all(bookDetailsPromises)).filter(Boolean); // Filter out nulls
        setReadingListBooks(fetchedBooks);
      } catch (err) {
        console.error("Failed to fetch reading list:", err);
        setError("Failed to load reading list.");
      } finally {
        setLoading(false);
      }
    };

    fetchReadingList();
  }, [isLoggedIn, user, token]);

  const booksToDisplay = readingListBooks.filter(book => book.read === showReadBooks);

  if (loading) {
    return <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px", textAlign: "center" }}>جاري تحميل قائمة القراءة...</div>;
  }

  if (error) {
    return <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px", textAlign: "center" }}>{error}</div>;
  }

  if (!isLoggedIn) {
    return (
      <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px", textAlign: "center", minHeight: "80vh" }}>
        <h1 style={{ color: theme.primary }}>قائمة القراءة</h1>
        <p style={{ fontSize: "1.2em", marginBottom: "20px" }}>يجب تسجيل الدخول لإدارة قائمة القراءة الخاصة بك.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <Link to="/login" style={{ backgroundColor: theme.accent, color: theme.primary, padding: "10px 20px", borderRadius: "5px", textDecoration: "none", fontWeight: "bold" }}>تسجيل الدخول</Link>
          <Link to="/register" style={{ backgroundColor: theme.secondary, color: theme.background, padding: "10px 20px", borderRadius: "5px", textDecoration: "none", fontWeight: "bold" }}>إنشاء حساب</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px" }}>
      <h1 style={{ color: theme.primary, textAlign: "center" }}>قائمة القراءة</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => setShowReadBooks(true)}
          style={{
            backgroundColor: showReadBooks ? theme.accent : theme.secondary,
            color: theme.primary,
            margin: "0 10px",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
          }}
        >
          الكتب التي تم قراءتها
        </button>
        <button
          onClick={() => setShowReadBooks(false)}
          style={{
            backgroundColor: !showReadBooks ? theme.accent : theme.secondary,
            color: theme.primary,
            margin: "0 10px",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
          }}
        >
          الكتب التي لم تتم قراءتها
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {booksToDisplay.length > 0 ? (
          booksToDisplay.map((book) => (
            <BookCard key={book._id} book={book} />
          ))
        ) : (
          <p>لا توجد كتب في هذه القائمة.</p>
        )}
      </div>
    </div>
  );
};

export default ReadingListPage;
