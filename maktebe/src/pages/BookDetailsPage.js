
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { FavoritesContext } from "../contexts/FavoritesContext";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { toast } from 'react-toastify';
import useFetch from "../hooks/useFetch";
import { API_URL } from "../constants";
import './BookDetailsPage.css'; // Import the CSS file

const BookDetailsPage = () => {
  const { theme } = useContext(ThemeContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const { isLoggedIn, user, token, setUser } = useContext(AuthContext); // Get user and token
  const { id } = useParams();
  const { data: bookData, loading, error } = useFetch(`${API_URL}/api/books/${id}`, [id]);
  const [book, setBook] = useState(null);
  const [isInReadingList, setIsInReadingList] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [bookComments, setBookComments] = useState([]);

  useEffect(() => {
    if (bookData) {
      setBook(bookData);
      setBookComments(bookData.comments || []);
      document.title = `مكتبة الكتب | ${bookData.title} - ${bookData.author}`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', bookData.description);
      }

      // Check if book is in reading list
      if (user && user.readingList) {
        const item = user.readingList.find(item => item.book === id);
        if (item) {
          setIsInReadingList(true);
          setIsRead(item.read);
        }
      }
    }
  }, [bookData, user, id]);

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      toast.error("يجب تسجيل الدخول لإضافة الكتاب للمفضلة.");
      return;
    }
    toggleFavorite(book._id);
  };

  const handleAddToReadingList = async () => {
    // Always open the PDF
    if (book && book.pdfFile) {
      window.open(`${API_URL}/uploads/${book.pdfFile}`, '_blank');
    } else {
      toast.error("ملف الكتاب غير متوفر.");
      return;
    }

    if (!isLoggedIn) {
      toast.info("لقد تم فتح الكتاب للقراءة. لتتمكن من إضافة الكتاب إلى قائمة القراءة وتتبع تقدمك والتعليق، يرجى تسجيل الدخول.");
      return; // Stop here if not logged in, as the PDF is already open
    }

    try {
      let updatedReadingList = user.readingList;
      let bookInReadingList = user.readingList.find(item => item.book === book._id);

      if (!bookInReadingList) {
        // Book not in reading list, add it
        const addRes = await axios.post(`${API_URL}/api/users/${user._id}/reading-list`, { bookId: book._id }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        updatedReadingList = addRes.data;
        setIsInReadingList(true);
        toast.success("تمت إضافة الكتاب إلى قائمة القراءة.");
      }

      // Now, ensure the book is marked as read
      // We need to re-find the item in case it was just added
      const currentBookItem = updatedReadingList.find(item => item.book === book._id);

      if (currentBookItem && !currentBookItem.read) {
        const patchRes = await axios.patch(`${API_URL}/api/users/${user._id}/reading-list/${book._id}`, { read: true }, {
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
      toast.error(err.response?.data?.message || "فشل تحديث قائمة القراءة.");
    }
  };

  

  const handleToggleReadStatus = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await axios.patch(`${API_URL}/api/users/${user._id}/reading-list/${book._id}`, { read: !isRead }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, readingList: res.data }); // Update user context
      setIsRead(!isRead);
      toast.success(`تم وضع علامة على الكتاب كـ ${!isRead ? "مقروء" : "غير مقروء"}.`);
    } catch (err) {
      console.error("Error toggling read status:", err);
      toast.error(err.response?.data?.message || "فشل تحديث حالة الكتاب.");
    }
  };

  const handleRemoveFromReadingList = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await axios.delete(`${API_URL}/api/users/${user._id}/reading-list/${book._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, readingList: res.data }); // Update user context
      setIsInReadingList(false);
      setIsRead(false);
      toast.success("تمت إزالة الكتاب من قائمة القراءة.");
    } catch (err) {
      console.error("Error removing from reading list:", err);
      toast.error(err.response?.data?.message || "فشل إزالة الكتاب من قائمة القراءة.");
    }
  };

  const handlePostComment = async () => {
    if (!isLoggedIn || !user || !token) {
      toast.error("يجب تسجيل الدخول لنشر تعليق.");
      return;
    }
    if (!commentText.trim()) {
      toast.error("لا يمكن نشر تعليق فارغ.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/books/${book._id}/comments`, { text: commentText }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookComments([...bookComments, res.data]);
      setCommentText('');
      toast.success("تم نشر التعليق بنجاح!");
    } catch (err) {
      console.error("Error posting comment:", err);
      toast.error(err.response?.data?.message || "فشل نشر التعليق.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isLoggedIn || !user || !token) {
      toast.error("يجب تسجيل الدخول لحذف تعليق.");
      return;
    }
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا التعليق؟")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/books/${book._id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookComments(bookComments.filter(comment => comment._id !== commentId));
      toast.success("تم حذف التعليق بنجاح!");
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error(err.response?.data?.message || "فشل حذف التعليق.");
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!isLoggedIn || !user || !token) {
      toast.error("يجب تسجيل الدخول للإعجاب بالتعليقات.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/books/${book._id}/comments/${commentId}/like`, {}, {
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
      toast.error(err.response?.data?.message || "فشل الإعجاب بالتعليق.");
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

  const bookSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author
    },
    "bookFormat": "http://schema.org/EBook", // Assuming it's an e-book
    "inLanguage": book.language,
    "numberOfPages": book.pages,
    "description": book.description,
    "image": `${API_URL}/uploads/${book.cover}`,
    "url": window.location.href,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5", // Placeholder, ideally from user ratings
      "reviewCount": book.comments ? book.comments.length : 0 // Number of comments as review count
    }
  };

  return (
    <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "40px 20px", display: "flex", flexDirection: "row-reverse", justifyContent: "center", alignItems: "flex-start", gap: "40px", flexWrap: "wrap" }}>
      <script type="application/ld+json">
        {JSON.stringify(bookSchema)}
      </script>
      <div className="book-cover-section">
        <img
          src={`${API_URL}/uploads/${book.cover}`}
          alt={`غلاف كتاب ${book.title}`}
          className="book-cover-image"
          loading="lazy"
        />
      </div>
      <div className="book-info-section">
        <h1 className="book-title" style={{ color: theme.primary, borderBottomColor: theme.accent }}>{book.title}</h1>
        <p className="book-meta-item"><strong>المؤلف:</strong> <span style={{ color: theme.accent }}>{book.author}</span></p>
        <p className="book-meta-item"><strong>التصنيف:</strong> {book.category}</p>
        <p className="book-meta-item"><strong>سنة النشر:</strong> {book.publishYear}</p>
        <p className="book-meta-item"><strong>عدد الصفحات:</strong> {book.pages}</p>
        <p className="book-meta-item"><strong>اللغة:</strong> {book.language}</p>
        <p className="book-meta-item"><strong>عدد القراءات:</strong> {book.readCount || 0}</p>
        <p className="book-meta-item"><strong>عدد الإعجابات:</strong> {book.favoriteCount || 0}</p>
        <h2 className="book-description-title" style={{ color: theme.primary, borderTopColor: theme.secondary }}>الوصف:</h2>
        <p className="book-description-text">{book.description}</p>

        

        {!isInReadingList && (
          <button
            onClick={handleAddToReadingList}
            className="book-action-button"
            style={{
              backgroundColor: theme.accent,
              color: theme.primary,
            }}
          >
            اقرأ الكتاب
          </button>
        )}

        {isInReadingList && (
          <div className="reading-list-buttons-group">
            <button
              onClick={handleToggleReadStatus}
              className="book-action-button"
              style={{
                backgroundColor: isRead ? theme.secondary : theme.accent,
                color: theme.primary,
              }}
            >
              {isRead ? "وضع علامة كغير مقروء" : "وضع علامة كمقروء"}
            </button>
            <button
              onClick={handleRemoveFromReadingList}
              className="book-action-button remove"
              style={{ color: theme.primary }}
            >
              إزالة من قائمة القراءة
            </button>
          </div>
        )}

        <button
          onClick={handleToggleFavorite}
          className="book-action-button"
          style={{
            backgroundColor: isLiked ? theme.secondary : theme.accent,
            color: theme.primary,
          }}
        >
          {isLiked ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        </button>

        <div className="comments-section" style={{ borderTopColor: theme.secondary }}>
          <h2 className="comments-title" style={{ color: theme.primary }}>التعليقات</h2>
          {isLoggedIn ? (
            <>
              <textarea
                placeholder="اكتب تعليقك هنا..."
                rows="4"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="comment-textarea"
                style={{
                  border: `1px solid ${theme.accent}`,
                  backgroundColor: theme.background,
                  color: theme.primary,
                }}
              ></textarea>
              <button
                onClick={handlePostComment}
                className="comment-post-button"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.primary,
                }}
              >
                نشر تعليق
              </button>
            </>
          ) : (
            <p className="no-comments-message" style={{ color: theme.primary }}>
              يجب تسجيل الدخول لكتابة تعليق.
            </p>
          )}
          <div style={{ marginTop: "20px" }}>
            {bookComments.length > 0 ? (
              bookComments.map((comment) => (
                <div key={comment._id} className="comment-item" style={{ backgroundColor: theme.secondary }}>
                  <img
                    src={comment.profilePicture && (comment.profilePicture !== 'Untitled.jpg' && comment.profilePicture !== 'user.jpg') ? comment.profilePicture : '/imgs/user.jpg'}
                    alt={`صورة ملف ${comment.username}`}
                    className="comment-user-avatar"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/imgs/user.jpg'; }}
                  />
                  <div className="comment-content">
                    <p className="comment-username" style={{ color: theme.primary }}>{comment.username}</p>
                    <p className="comment-text" style={{ color: theme.primary }}>{comment.text}</p>
                    <p className="comment-date" style={{ color: theme.primary }}>{new Date(comment.createdAt).toLocaleDateString()}</p>
                    <div className="comment-actions">
                      <span
                        onClick={() => handleToggleLike(comment._id)}
                        className={`comment-like-button ${comment.likes && comment.likes.includes(user?._id) ? 'liked' : ''}`}
                        style={{ color: comment.likes && comment.likes.includes(user?._id) ? "red" : theme.primary }}
                      >
                        {(comment.likes && comment.likes.includes(user?._id)) ? '❤️' : '♡'} <span style={{ fontSize: "0.8em" }}>({comment.likes ? comment.likes.length : 0})</span>
                      </span>
                    </div>
                  </div>
                  {(isLoggedIn && user && (user._id === comment.user || user.role === 'admin')) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="comment-delete-button"
                      style={{ backgroundColor: '#dc3545' }}
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
