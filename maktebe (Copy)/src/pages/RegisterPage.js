
import React, { useContext, useState } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { API_URL } from "../constants";
import './AuthPage.css'; // Import the CSS file

const RegisterPage = () => {
  const { theme } = useContext(ThemeContext);
  
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Basic email validation function
  const validateEmail = (email) => {
    // Regular expression for basic email validation
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error("البريد الإلكتروني غير صحيح.");
      return;
    }

    if (password.length < 6) {
      toast.error("يجب أن تكون كلمة المرور 6 أحرف على الأقل.");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/users/register`, {
        username,
        email,
        password,
      });
      toast.success("تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.");
      navigate("/login"); // Redirect to login page after registration
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error(err.response?.data?.message || "فشل التسجيل");
    }
  };

  return (
    <div className="auth-container" style={{ backgroundColor: theme.background, color: theme.primary }}>
      <h1 className="auth-title" style={{ color: theme.primary }}>إنشاء حساب</h1>
      <form onSubmit={handleSubmit} className="auth-form" style={{ backgroundColor: theme.secondary, color: theme.primary }}>
        <label>اسم المستخدم:</label>
        <input
          type="text"
          placeholder="اسم المستخدم"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ backgroundColor: theme.background, color: theme.primary, borderColor: theme.accent }}
        />
        <label>البريد الإلكتروني:</label>
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ backgroundColor: theme.background, color: theme.primary, borderColor: theme.accent }}
        />
        <label>كلمة المرور:</label>
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ backgroundColor: theme.background, color: theme.primary, borderColor: theme.accent }}
        />
        <button type="submit" style={{ backgroundColor: theme.accent, color: theme.primary }}>إنشاء</button>
      </form>
    </div>
  );
};

export default RegisterPage;
