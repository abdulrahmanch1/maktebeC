
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// Import your page components here
import HomePage from '../pages/HomePage';
import ComplaintsPage from '../pages/ComplaintsPage';
import SettingsPage from '../pages/SettingsPage';
import BookDetailsPage from '../pages/BookDetailsPage';
import AdminPage from '../pages/AdminPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import FavoritesPage from '../pages/FavoritesPage';
import ReadingListPage from '../pages/ReadingListPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="book/:id" element={<BookDetailsPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="reading-list" element={<ReadingListPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
