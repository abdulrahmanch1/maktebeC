import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const NotFoundPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      style={{
        backgroundColor: theme.background,
        color: theme.primary,
        padding: "50px",
        textAlign: "center",
        minHeight: "calc(100vh - 120px)", // Adjust based on header/footer height
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1 style={{ fontSize: "5em", margin: "0" }}>404</h1>
      <h2 style={{ fontSize: "2em", marginTop: "10px" }}>الصفحة غير موجودة</h2>
      <p style={{ fontSize: "1.2em", marginTop: "20px" }}>عذرًا، الصفحة التي تبحث عنها غير موجودة.</p>
      <a href="/" style={{ color: theme.accent, textDecoration: "none", marginTop: "30px", fontSize: "1.1em" }}>العودة إلى الصفحة الرئيسية</a>
    </div>
  );
};

export default NotFoundPage;