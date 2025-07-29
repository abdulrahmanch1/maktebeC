import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import './NotFoundPage.css'; // Import the CSS file

const NotFoundPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className="not-found-container"
      style={{
        backgroundColor: theme.background,
        color: theme.primary,
      }}
    >
      <h1 className="not-found-title">404</h1>
      <h2 className="not-found-subtitle">الصفحة غير موجودة</h2>
      <p className="not-found-message">عذرًا، الصفحة التي تبحث عنها غير موجودة.</p>
      <a href="/" className="not-found-link" style={{ color: theme.accent }}>العودة إلى الصفحة الرئيسية</a>
    </div>
  );
};

export default NotFoundPage;