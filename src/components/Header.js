
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { API_URL } from "../constants";
import './Header.css'; // Import the CSS file

const Header = () => {
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn, user, logout } = useContext(AuthContext);

  return (
    <header className="header" style={{
      backgroundColor: theme.primary,
      color: theme.background,
    }}>
      <nav className="header-nav">
        <Link to="/" className="header-link" style={{ color: theme.background }}>الرئيسية</Link>
        <Link to="/settings" className="header-link" style={{ color: theme.background }}>الإعدادات</Link>
        <Link to="/favorites" className="header-link" style={{ color: theme.background }}>المفضلة</Link>
        <Link to="/reading-list" className="header-link" style={{ color: theme.background }}>قائمة القراءة</Link>
      </nav>
      
      <div className="header-user-section">
        {isLoggedIn ? (
          <>
            <Link to="/settings" className="header-link" style={{ color: theme.background }}>{user ? user.username : "اسم المستخدم"}</Link>
            <img
              src={user && user.profilePicture && (user.profilePicture !== 'Untitled.jpg' && user.profilePicture !== 'user.jpg') ? `${API_URL}/uploads/${user.profilePicture}` : '/imgs/user.jpg'}
              onError={(e) => { e.target.onerror = null; e.target.src = '/imgs/user.jpg'; }}
              alt="user"
              className="header-user-avatar"
            />
            <button onClick={logout} className="header-button" style={{ backgroundColor: theme.accent, color: theme.primary }}>تسجيل الخروج</button>
          </>
        ) : (
          <>
            <Link to="/login" className="header-link" style={{ color: theme.background, marginLeft: "10px" }}>تسجيل الدخول</Link>
            <Link to="/register" className="header-button header-link" style={{ backgroundColor: theme.accent, color: theme.primary }}>إنشاء حساب</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
