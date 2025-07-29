import React, { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { themes } from "../data/themes";
import { toast } from 'react-toastify';
import { API_URL } from "../constants";
import "./SettingsPage.css"; // Import the new CSS file

const SettingsPage = () => {
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState("account");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsDropdownOpen(false); // Close dropdown on selection
  };

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return <AccountSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "security":
        return <SecuritySettings />;
      case "contact":
        return <ContactUsSection />;
      default:
        return <AccountSettings />;
    }
  };

  const sidebarItems = [
    { key: "account", icon: "👤", text: "إعدادات الحساب" },
    { key: "appearance", icon: "🎨", text: "المظهر" },
    { key: "security", icon: "🔒", text: "الأمان" },
    { key: "contact", icon: "✉️", text: "تواصل معنا" },
  ];

  return (
    <div className="settings-container" style={{ backgroundColor: theme.background, color: theme.primary }}>
      {/* Desktop Sidebar */}
      <aside className="settings-sidebar" style={{ borderColor: theme.secondary, backgroundColor: theme.secondary }}>
        {sidebarItems.map(item => (
          <div
            key={item.key}
            className={`settings-sidebar-item ${activeSection === item.key ? "active" : ""}`}
            style={{
              color: activeSection === item.key ? theme.background : theme.primary,
              backgroundColor: activeSection === item.key ? theme.primary : "transparent",
            }}
            onClick={() => handleSectionChange(item.key)}
          >
            <span>{item.icon}</span>
            <span className="settings-sidebar-text">{item.text}</span>
          </div>
        ))}
      </aside>

      {/* Mobile Header & Dropdown */}
      <div className="settings-mobile-header">
        <button className="settings-mobile-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ backgroundColor: theme.secondary, color: theme.primary, borderColor: theme.accent }}>
          <span>⚙️</span>
          <span>الملف الشخصي</span>
        </button>
        {isDropdownOpen && (
          <div className="settings-dropdown" style={{ backgroundColor: theme.secondary, borderColor: theme.accent }}>
            {sidebarItems.map(item => (
              <div
                key={item.key}
                className="settings-dropdown-item"
                style={{
                  color: activeSection === item.key ? theme.background : theme.primary,
                  backgroundColor: activeSection === item.key ? theme.primary : "transparent",
                  borderBottom: `1px solid ${theme.accent}`
                }}
                onClick={() => handleSectionChange(item.key)}
              >
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <main className="settings-content">{renderSection()}</main>
    </div>
  );
};

// ... (rest of the components: ContactUsSection, AccountSettings, etc. remain the same)

// Contact Us Section
const ContactUsSection = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext); // Get user from AuthContext
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const email = user?.email || "guest@example.com"; // Default email for guests
      const username = user?.username || "Guest"; // Default username for guests

      await axios.post(`${API_URL}/api/contact`, {
        subject,
        message,
        email,
        username,
      });
      toast.success("تم إرسال رسالتك بنجاح!");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error sending contact message:", error);
      toast.error(error.response?.data?.message || "فشل إرسال الرسالة.");
    }
  };

  return (
    <div className="settings-section">
      <h2 style={{ borderColor: theme.accent, color: theme.primary }}>تواصل معنا</h2>
      <form onSubmit={handleSubmit} style={{ backgroundColor: theme.background, padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" }}>
        <div className="form-group">
          <label style={{ color: theme.primary }}>الموضوع:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="موضوع الرسالة"
            required
            style={{ borderColor: theme.secondary, backgroundColor: theme.background, color: theme.primary }}
          />
        </div>
        <div className="form-group">
          <label style={{ color: theme.primary }}>رسالتك:</label>
          <textarea
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            required
            style={{ borderColor: theme.secondary, backgroundColor: theme.background, color: theme.primary }}
          ></textarea>
        </div>
        <button type="submit" className="button" style={{ backgroundColor: theme.accent, color: theme.primary }}>
          إرسال الرسالة
        </button>
      </form>
    </div>
  );
};

// Account Settings Component
const AccountSettings = () => {
  const { theme } = useContext(ThemeContext);
  const { user, token, setUser } = useContext(AuthContext);
  const [newUsername, setNewUsername] = useState(user ? user.username : "");
  const fileInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePicture", file);
    try {
      const res = await axios.patch(`${API_URL}/api/users/${user._id}/profile-picture`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, profilePicture: res.data.profilePicture });
      toast.success("تم تحديث الصورة بنجاح!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleUsernameUpdate = async () => {
    try {
      const res = await axios.patch(`${API_URL}/api/users/${user._id}`, { username: newUsername }, { headers: { Authorization: `Bearer ${token}` } });
      setUser({ ...user, username: res.data.username });
      toast.success("تم تحديث اسم المستخدم بنجاح!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="settings-section">
      <h2 style={{ borderColor: theme.accent, color: theme.primary }}>إعدادات الحساب</h2>
      <div className="profile-info-section">
        <img
          src={user && user.profilePicture && (user.profilePicture !== 'Untitled.jpg' && user.profilePicture !== 'user.jpg') ? `${API_URL}/uploads/${user.profilePicture}` : '/imgs/user.jpg'}
          alt="Profile"
          className="profile-picture"
          style={{ borderColor: theme.accent }}
          onError={(e) => { e.target.onerror = null; e.target.src = '/imgs/user.jpg'; }}
        />
        <span className="profile-email" style={{ color: theme.primary }}>{user ? user.email : "غير متاح"}</span>
        <input type="file" onChange={handleImageChange} ref={fileInputRef} style={{ display: 'none' }} />
        <button className="button change-picture-button" onClick={() => fileInputRef.current.click()} style={{ backgroundColor: theme.accent, color: theme.primary }}>
          تغيير الصورة
        </button>
      </div>
      <div className="form-group username-form-group">
        <label>اسم المستخدم</label>
        <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} style={{ borderColor: theme.secondary, backgroundColor: theme.background, color: theme.primary }} />
        <button className="button" onClick={handleUsernameUpdate} style={{ backgroundColor: theme.accent, color: theme.primary }}>
          تحديث اسم المستخدم
        </button>
      </div>
      
    </div>
  );
};

// Appearance Settings Component
const AppearanceSettings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div className="settings-section">
      <h2 style={{ borderColor: theme.accent, color: theme.primary }}>إعدادات المظهر</h2>
      <div className="form-group">
        <label>اختر ثيمًا:</label>
        <div className="theme-options">
          {Object.keys(themes).map((themeName) => (
            <div
              key={themeName}
              className={`theme-option ${theme.primary === themes[themeName].primary ? "active" : ""}`}
              style={{ backgroundColor: themes[themeName].background, color: themes[themeName].primary, boxShadow: theme.primary === themes[themeName].primary ? `0 0 15px ${themes[themeName].accent}` : '' }}
              onClick={() => toggleTheme(themeName)}
            >
              {themes[themeName].name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Security Settings Component
const SecuritySettings = () => {
  const { theme } = useContext(ThemeContext);
  const [passwordResetEmailSent, setPasswordResetEmailSent] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false); // New state for account privacy

  const handlePasswordResetRequest = () => {
    // In a real application, you would send an API request here
    // to trigger the email sending process on the backend.
    // For now, we just set the state to true.
    setPasswordResetEmailSent(true);
    toast.info("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك.");
  };

  return (
    <div className="settings-section">
      <h2 style={{ borderColor: theme.accent, color: theme.primary }}>إعدادات الأمان</h2>
      <div className="form-group">
        <label>تغيير كلمة المرور</label>
        {passwordResetEmailSent ? (
          <p style={{ color: theme.primary, textAlign: "center" }}>تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك.</p>
        ) : (
          <button className="button" onClick={handlePasswordResetRequest} style={{ backgroundColor: theme.accent, color: theme.primary }}>
            تغيير كلمة المرور
          </button>
        )}
      </div>
      <div className="form-group">
        <label>خصوصية الحساب:</label>
        <select
          value={isPrivate ? "private" : "public"}
          onChange={(e) => setIsPrivate(e.target.value === "private")}
          style={{ borderColor: theme.secondary, backgroundColor: theme.background, color: theme.primary }}
        >
          <option value="public">عام</option>
          <option value="private">خاص</option>
        </select>
      </div>
      <div className="form-group">
        <label>حذف الحساب</label>
        <button className="button button-danger" style={{ backgroundColor: "#e74c3c" }}>
          حذف الحساب نهائيًا
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;