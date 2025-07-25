
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";

const Header = () => {
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn, user, logout } = useContext(AuthContext);

  return (
    <header
      style={{
        backgroundColor: theme.primary,
        color: theme.background,
        padding: "15px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <nav>
        <Link to="/" style={{ color: theme.background }}>الرئيسية</Link>
        <Link to="/complaints" style={{ color: theme.background }}>الشكاوى</Link>
        <Link to="/settings" style={{ color: theme.background }}>الإعدادات</Link>
        <Link to="/favorites" style={{ color: theme.background }}>المفضلة</Link>
        <Link to="/reading-list" style={{ color: theme.background }}>قائمة القراءة</Link>
      </nav>
      
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {isLoggedIn ? (
          <>
            <Link to="/settings" style={{ color: theme.background }}>{user ? user.username : "اسم المستخدم"}</Link>
            <img
              src="/imgs/user_avatar.png"
              alt="user"
              style={{ borderRadius: "50%", width: "40px", height: "40px" }}
            />
            <button onClick={logout} style={{ backgroundColor: theme.accent, color: theme.primary, border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer" }}>تسجيل الخروج</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: theme.background, marginLeft: "10px" }}>تسجيل الدخول</Link>
            <Link to="/register" style={{ backgroundColor: theme.accent, color: theme.primary, padding: "8px 12px", borderRadius: "5px", textDecoration: "none" }}>إنشاء حساب</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
