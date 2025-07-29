import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggle, isLoggedIn, logout }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{ backgroundColor: theme.secondary }}>
      <div className="sidebar-header">
        <button onClick={toggle} className="close-btn" style={{ color: theme.primary }}>&times;</button>
      </div>
      <nav className="sidebar-nav">
        <Link to="/" onClick={toggle} style={{ color: theme.primary }}>الرئيسية</Link>
        <Link to="/settings" onClick={toggle} style={{ color: theme.primary }}>الإعدادات</Link>
        <Link to="/favorites" onClick={toggle} style={{ color: theme.primary }}>المفضلة</Link>
        <Link to="/reading-list" onClick={toggle} style={{ color: theme.primary }}>قائمة القراءة</Link>
        {isLoggedIn && (
          <button onClick={() => { logout(); toggle(); }} className="sidebar-logout-button" style={{ backgroundColor: theme.accent, color: theme.primary }}>تسجيل الخروج</button>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
