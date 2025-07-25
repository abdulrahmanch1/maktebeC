
import React, { useContext, useState } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const { theme } = useContext(ThemeContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/register`, {
        username,
        email,
        password,
      });
      // Log in the user immediately after successful registration
      await login(email, password); // Assuming login also handles setting user data
      navigate("/"); // Redirect to home page
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px", minHeight: "80vh" }}>
      <h1 style={{ textAlign: "center", color: theme.primary }}>إنشاء حساب</h1>
      <form onSubmit={handleSubmit} style={{ backgroundColor: theme.secondary, color: theme.background }}>
        <label style={{ color: theme.background }}>اسم المستخدم:</label>
        <input
          type="text"
          placeholder="اسم المستخدم"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ backgroundColor: theme.background, color: theme.primary, borderColor: theme.accent }}
        />
        <label style={{ color: theme.background }}>البريد الإلكتروني:</label>
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ backgroundColor: theme.background, color: theme.primary, borderColor: theme.accent }}
        />
        <label style={{ color: theme.background }}>كلمة المرور:</label>
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ backgroundColor: theme.background, color: theme.primary, borderColor: theme.accent }}
        />
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <button type="submit" style={{ backgroundColor: theme.accent, color: theme.primary }}>إنشاء</button>
      </form>
    </div>
  );
};

export default RegisterPage;
