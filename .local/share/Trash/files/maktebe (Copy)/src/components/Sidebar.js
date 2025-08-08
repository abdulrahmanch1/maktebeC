import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext'; // Import AuthContext
import './Sidebar.css';

const Sidebar = ({ isOpen, toggle, isLoggedIn, logout }) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext); // Get user from AuthContext
  const location = useLocation(); // Get current location

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? theme.primary : theme.primary,
      backgroundColor: isActive ? theme.accent : 'transparent', // Apply accent color if active
      fontWeight: isActive ? 'bold' : 'normal',
      width: '80%', // Apply 80% width to all links
      borderRadius: isActive ? '25px' : '0', // Apply 25px border-radius if active
      // Removed margin: '0 auto' as parent's align-items: center handles centering
    };
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{ backgroundColor: theme.secondary }}>
      <div className="sidebar-header">
        <button onClick={toggle} className="close-btn" style={{ color: theme.primary }}>&times;</button>
      </div>
      <nav className="sidebar-nav">
        <Link to="/" onClick={toggle} style={getLinkStyle('/')}>الرئيسية</Link>
        <Link to="/settings" onClick={toggle} style={getLinkStyle('/settings')}>الإعدادات</Link>
        <Link to="/favorites" onClick={toggle} style={getLinkStyle('/favorites')}>المفضلة</Link>
        <Link to="/reading-list" onClick={toggle} style={getLinkStyle('/reading-list')}>قائمة القراءة</Link>
        {isLoggedIn && user && user.role === 'admin' && (
          <Link to="/admin" onClick={toggle} style={getLinkStyle('/admin')}>لوحة التحكم</Link>
        )}
      </nav>
      {isLoggedIn && (
        <button onClick={() => { logout(); toggle(); }} className="sidebar-logout-button" style={{ backgroundColor: theme.accent, color: theme.primary }}>تسجيل الخروج</button>
      )}
    </div>
  );
};

export default Sidebar;