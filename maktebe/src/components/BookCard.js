import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { FavoritesContext } from "../contexts/FavoritesContext";
import { AuthContext } from "../contexts/AuthContext"; // Import AuthContext
import { toast } from 'react-toastify';

import './BookCard.css'; // Import the CSS file

const BookCard = ({ book }) => {
  const { theme } = useContext(ThemeContext);
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const { isLoggedIn } = useContext(AuthContext); // Get isLoggedIn from AuthContext
  const navigate = useNavigate();
  const isLiked = book?._id ? isFavorite(book._id) : false;

  

  const handleReadClick = () => {
    navigate(`/book/${book._id}`);
  };

  return (
    <div className="book-card" style={{
      backgroundColor: theme.background,
      color: theme.primary,
      border: `1px solid ${theme.secondary}`,
    }}>
      <img
        src={book.cover}
        alt={`غلاف كتاب ${book.title}`}
        className="book-card-image"
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop
          e.target.src = "/imgs/no_cover_available.png";
        }}
      />
      <h2 className="book-card-title" style={{ color: theme.accent }}>
        {book.title}
      </h2>
      <div className="book-card-actions">
        <button
            onClick={handleReadClick}
            className="read-button"
            style={{
              backgroundColor: theme.accent,
              color: theme.primary,
            }}
          >
            اقرأ
          </button>
        <span
          onClick={() => {
            if (!isLoggedIn) {
              toast.error("يجب تسجيل الدخول لإضافة الكتاب للمفضلة.");
              return;
            }
            toggleFavorite(book._id);
          }}
          className={`favorite-icon ${isLiked ? 'liked' : ''}`}
          style={{
            backgroundColor: theme.primary,
          }}
        >
          {isLiked ? '❤️' : '♡'}
        </span>
      </div>
    </div>
  );
};

export default BookCard;
