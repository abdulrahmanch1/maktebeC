
import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ThemeContext } from "../contexts/ThemeContext";
import './MainLayout.css'; // Import the CSS file

const MainLayout = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="main-layout" style={{
      backgroundColor: theme.background,
      color: theme.primary,
    }}>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
