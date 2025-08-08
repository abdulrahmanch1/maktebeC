import React, { useEffect, useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { API_URL } from "../constants";
import axios from 'axios';
import './VerifyEmailPage.css'; // Import the CSS file

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('جاري تأكيد بريدك الإلكتروني...');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setMessage('رمز التحقق مفقود.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/users/verify-email/${token}`);
        setMessage(response.data.message);
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 3000); // Redirect to login after 3 seconds
      } catch (err) {
        setError(err);
        setMessage(err.response?.data?.message || 'فشل تأكيد البريد الإلكتروني.');
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div
      className="verify-email-container"
      style={{
        backgroundColor: theme.background,
        color: theme.primary,
      }}
    >
      <h1 className="verify-email-message" style={{ color: error ? 'red' : theme.accent }}>{message}</h1>
      {!error && !loading && <p className="verify-email-redirect-message" style={{ color: theme.primary }}>سيتم توجيهك إلى صفحة تسجيل الدخول قريبًا...</p>}
      {error && <a href="/register" className="verify-email-link" style={{ color: theme.accent }}>إعادة التسجيل</a>}
    </div>
  );
};

export default VerifyEmailPage;