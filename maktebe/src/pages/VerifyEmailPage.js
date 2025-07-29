import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { ThemeContext } from '../contexts/ThemeContext';
import { API_URL } from "../constants";
import './VerifyEmailPage.css'; // Import the CSS file

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const { data, loading, error } = useFetch(
    token ? `${API_URL}/api/users/verify-email/${token}` : null
  );

  useEffect(() => {
    if (!loading) {
      if (data) {
        setTimeout(() => {
          navigate('/login');
        }, 3000); // Redirect to login after 3 seconds
      }
    }
  }, [data, loading, navigate]);

  let message = 'جاري تأكيد بريدك الإلكتروني...';
  let isError = false;

  if (!token) {
    message = 'رمز التحقق مفقود.';
    isError = true;
  } else if (!loading) {
    if (error) {
      message = error.response?.data?.message || 'فشل تأكيد البريد الإلكتروني.';
      isError = true;
    } else if (data) {
      message = data.message;
      isError = false;
    }
  }

  return (
    <div
      className="verify-email-container"
      style={{
        backgroundColor: theme.background,
        color: theme.primary,
      }}
    >
      <h1 className="verify-email-message" style={{ color: error ? 'red' : theme.accent }}>{message}</h1>
      {!error && <p className="verify-email-redirect-message" style={{ color: theme.primary }}>سيتم توجيهك إلى صفحة تسجيل الدخول قريبًا...</p>}
      {error && <a href="/register" className="verify-email-link" style={{ color: theme.accent }}>إعادة التسجيل</a>}
    </div>
  );
};

export default VerifyEmailPage;