import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../contexts/ThemeContext';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('جاري تأكيد بريدك الإلكتروني...');
  const [error, setError] = useState(false);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/verify-email/${token}`);
        setMessage(response.data.message);
        setError(false);
        setTimeout(() => {
          navigate('/login');
        }, 3000); // Redirect to login after 3 seconds
      } catch (err) {
        setMessage(err.response?.data?.message || 'فشل تأكيد البريد الإلكتروني.');
        setError(true);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setMessage('رمز التحقق مفقود.');
      setError(true);
    }
  }, [token, navigate]);

  return (
    <div
      style={{
        backgroundColor: theme.background,
        color: theme.primary,
        padding: "50px",
        textAlign: "center",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1 style={{ color: error ? 'red' : theme.accent }}>{message}</h1>
      {!error && <p style={{ color: theme.primary }}>سيتم توجيهك إلى صفحة تسجيل الدخول قريبًا...</p>}
      {error && <a href="/register" style={{ color: theme.accent, textDecoration: "none", marginTop: "20px" }}>إعادة التسجيل</a>}
    </div>
  );
};

export default VerifyEmailPage;