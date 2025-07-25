
import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const Footer = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <footer
      style={{
        backgroundColor: theme.primary,
        color: theme.background,
        padding: "20px",
        textAlign: "center",
        marginTop: "auto",
      }}
    >
      <p>جميع الحقوق محفوظة © 2025</p>
    </footer>
  );
};

export default Footer;
