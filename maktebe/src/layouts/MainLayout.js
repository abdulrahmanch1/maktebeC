
<<<<<<< HEAD
import React, { useContext } from "react";
=======
import React, { useContext, useEffect } from "react";
>>>>>>> 1188a9b (feat: Implement email verification for user registration)
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ThemeContext } from "../contexts/ThemeContext";
import './MainLayout.css'; // Import the CSS file

const MainLayout = () => {
  const { theme } = useContext(ThemeContext);

<<<<<<< HEAD
  return (
    <div className="main-layout" style={{
      backgroundColor: theme.background,
      color: theme.primary,
    }}>
=======
  useEffect(() => {
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.primary;
  }, [theme]);

  return (
    <div className="main-layout">
>>>>>>> 1188a9b (feat: Implement email verification for user registration)
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
