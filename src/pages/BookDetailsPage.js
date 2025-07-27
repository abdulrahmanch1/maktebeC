
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
  const [commentText, setCommentText] = useState('');
  const [bookComments, setBookComments] = useState([]);
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/books/${id}`);
        setBook(response.data);
        setBookComments(response.data.comments || []);
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
    // Always open the PDF
    if (book && book.pdfFile) {
      window.open(`${process.env.REACT_APP_API_URL}/uploads/${book.pdfFile}`, '_blank');
    } else {
      alert("ملف الكتاب غير متوفر.");
      return;
    }

    if (!isLoggedIn) {
      alert("لقد تم فتح الكتاب للقراءة. لتتمكن من إضافة الكتاب إلى قائمة القراءة وتتبع تقدمك والتعليق، يرجى تسجيل الدخول.");
      return; // Stop here if not logged in, as the PDF is already open
    }

    try {
      let updatedReadingList = user.readingList;
      let bookInReadingList = user.readingList.find(item => item.book === book._id);

      if (!bookInReadingList) {
        // Book not in reading list, add it
        const addRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/${user._id}/reading-list`, { bookId: book._id }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        updatedReadingList = addRes.data;
        setIsInReadingList(true);
        alert("تمت إضافة الكتاب إلى قائمة القراءة.");
      }

      // Now, ensure the book is marked as read
      // We need to re-find the item in case it was just added
      const currentBookItem = updatedReadingList.find(item => item.book === book._id);

      if (currentBookItem && !currentBookItem.read) {
        const patchRes = await axios.patch(`${process.env.REACT_APP_API_URL}/api/users/${user._id}/reading-list/${book._id}`, { read: true }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        updatedReadingList = patchRes.data;
        setIsRead(true);
      } else if (currentBookItem && currentBookItem.read) {
        // Book is already in reading list and marked as read, no action needed
      }

      setUser({ ...user, readingList: updatedReadingList }); // Update user context
    } catch (err) {
      console.error("Error handling reading list:", err);
      alert(err.response?.data?.message || "فشل تحديث قائمة القراءة.");
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

  const handlePostComment = async () => {
    if (!isLoggedIn || !user || !token) {
      alert("يجب تسجيل الدخول لنشر تعليق.");
      return;
    }
    if (!commentText.trim()) {
      alert("لا يمكن نشر تعليق فارغ.");
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/books/${book._id}/comments`, { text: commentText }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookComments([...bookComments, res.data]);
      setCommentText('');
      alert("تم نشر التعليق بنجاح!");
    } catch (err) {
      console.error("Error posting comment:", err);
      alert(err.response?.data?.message || "فشل نشر التعليق.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isLoggedIn || !user || !token) {
      alert("يجب تسجيل الدخول لحذف تعليق.");
      return;
    }
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا التعليق؟")) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/books/${book._id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookComments(bookComments.filter(comment => comment._id !== commentId));
      alert("تم حذف التعليق بنجاح!");
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert(err.response?.data?.message || "فشل حذف التعليق.");
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!isLoggedIn || !user || !token) {
      alert("يجب تسجيل الدخول للإعجاب بالتعليقات.");
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/books/${book._id}/comments/${commentId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the specific comment's likes in the state
      setBookComments(prevComments =>
        prevComments.map(comment =>
          comment._id === commentId
            ? { ...comment, likes: res.data.liked ? [...comment.likes, user._id] : comment.likes.filter(id => id !== user._id) }
            : comment
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
      alert(err.response?.data?.message || "فشل الإعجاب بالتعليق.");
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
        <p style={{ fontSize: "1.2em" }}><strong>عدد القراءات:</strong> {book.readCount || 0}</p>
        <p style={{ fontSize: "1.2em" }}><strong>عدد الإعجابات:</strong> {book.favoriteCount || 0}</p>
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

        <div style={{ marginTop: "30px", borderTop: `1px solid ${theme.secondary}`, paddingTop: "20px" }}>
          <h2 style={{ color: theme.primary, marginBottom: "15px" }}>التعليقات</h2>
          {isLoggedIn ? (
            <>
              <textarea
                placeholder="اكتب تعليقك هنا..."
                rows="4"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: `1px solid ${theme.accent}`,
                  backgroundColor: theme.background,
                  color: theme.primary,
                  marginBottom: "10px",
                  boxSizing: "border-box",
                }}
              ></textarea>
              <button
                onClick={handlePostComment}
                style={{
                  backgroundColor: theme.accent,
                  color: theme.primary,
                  padding: "10px 20px",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1em",
                  fontWeight: "bold",
                  transition: "background-color 0.3s ease",
                }}
              >
                نشر تعليق
              </button>
            </>
          ) : (
            <p style={{ color: theme.primary, textAlign: "center", marginBottom: "20px" }}>
              يجب تسجيل الدخول لكتابة تعليق.
            </p>
          )}
          <div style={{ marginTop: "20px" }}>
            {bookComments.length > 0 ? (
              bookComments.map((comment, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "15px", padding: "10px", backgroundColor: theme.secondary, borderRadius: "8px" }}>
                  <img
                    src={comment.profilePicture && (comment.profilePicture !== 'Untitled.jpg' && comment.profilePicture !== 'user.jpg') ? `${process.env.REACT_APP_API_URL}/uploads/${comment.profilePicture}` : '/imgs/user.jpg'}
                    alt="User Profile"
                    style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" , marginLeft: "10px"}}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/imgs/user.jpg'; }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <p style={{ margin: "0", fontWeight: "bold", color: theme.background }}>{comment.username}</p>
                    <p style={{ margin: "5px 0 0 0", color: theme.background }}>{comment.text}</p>
                    <p style={{ margin: "0", fontSize: "0.8em", color: theme.background, opacity: 0.7 }}>{new Date(comment.createdAt).toLocaleDateString()}</p>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
                      <span
                        onClick={() => handleToggleLike(comment._id)}
                        style={{
                          cursor: "pointer",
                          color: comment.likes && comment.likes.includes(user?._id) ? "red" : "red", // Red when liked, red when not (for outline)
                          fontSize: "20px",
                          marginRight: "10px",
                          transition: "color 0.3s ease, transform 0.3s ease",
                          transform: (comment.likes && comment.likes.includes(user?._id)) ? "scale(1.1)" : "scale(1)",
                        }}
                      >
                        {(comment.likes && comment.likes.includes(user?._id)) ? '❤️' : '♡'} <span style={{ fontSize: "0.8em" }}>({comment.likes ? comment.likes.length : 0})</span>
                      </span>
                    </div>
                  </div>
                  {(isLoggedIn && user && (user._id === comment.user || user.role === 'admin')) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontSize: '0.8em',
                        marginLeft: '10px',
                      }}
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: theme.primary, textAlign: "center" }}>لا توجد تعليقات حتى الآن. كن أول من يعلق!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsPage;
