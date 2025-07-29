
import React, { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ThemeContext } from "../contexts/ThemeContext";
import './MainLayout.css'; // Import the CSS file

const MainLayout = () => {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.primary;
  }, [theme]);

  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
