import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { FavoritesContext } from "../contexts/FavoritesContext";
import { AuthContext } from "../contexts/AuthContext"; // Import AuthContext

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
    <div
      style={{
        backgroundColor: theme.background,
        color: theme.primary,
        border: `1px solid ${theme.secondary}`,
        borderRadius: "8px",
        padding: "15px",
        margin: "10px",
        textAlign: "center",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        width: "200px",
        height: "450px", /* Fixed height for the card */
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <img
        src={`${process.env.REACT_APP_API_URL}/uploads/${book.cover}`}
        alt="صورة الكتاب"
        style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: "4px", display: "block", margin: "0 auto" }}
      />
      <h2 style={{ fontSize: "1.2em", marginTop: "3px" , marginBottom: "3px", fontWeight: "bold", textAlign: "center", color: theme.accent, margin: "0 auto"}}>
        {book.title}
      </h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
        <button
          onClick={handleReadClick}
          style={{
            backgroundColor: theme.accent,
            color: theme.primary,
            padding: "8px 12px ", /* Smaller padding */
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            flexGrow: 1, /* Allow button to grow */
            marginRight: "5px", /* Small gap */
          }}
        >
          قراءة الكتاب
        </button>
        <span
          onClick={() => {
            if (!isLoggedIn) {
              alert("يجب تسجيل الدخول لإضافة الكتاب للمفضلة.");
              return;
            }
            toggleFavorite(book._id);
          }}
          style={{
            cursor: "pointer",
            color: isLiked ? "red" : "white", /* White by default, red when liked */
            fontSize: "20px", /* Slightly smaller heart */
            backgroundColor: theme.primary, /* Background for the heart icon */
            padding: "4px",
            marginRight:"4px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "30px", /* Fixed width for circular background */
            height: "30px", /* Fixed height for circular background */
            transition: "color 0.3s ease, background-color 0.3s ease, transform 0.3s ease", /* Add transform to transition */
            transform: isLiked ? "scale(1.2)" : "scale(1)", /* Scale effect */
          }}
        >
          {isLiked ? '❤️' : '♡'}
        </span>
      </div>
    </div>
  );
};

export default BookCard;