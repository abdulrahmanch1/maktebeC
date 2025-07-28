
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// Import your page components here
import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';
import BookDetailsPage from '../pages/BookDetailsPage';
import AdminPage from '../pages/AdminPage';
import ContactMessagesPage from '../pages/ContactMessagesPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import FavoritesPage from '../pages/FavoritesPage';
import ReadingListPage from '../pages/ReadingListPage';
import NotFoundPage from '../pages/NotFoundPage'; // Import NotFoundPage
import VerifyEmailPage from '../pages/VerifyEmailPage'; // Import VerifyEmailPage

const AppRoutes = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="book/:id" element={<BookDetailsPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="admin/contact-messages" element={<ContactMessagesPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="reading-list" element={<ReadingListPage />} />
          <Route path="verify-email/:token" element={<VerifyEmailPage />} /> {/* New route for email verification */}
          <Route path="*" element={<NotFoundPage />} /> {/* Catch-all route for 404 */}
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
