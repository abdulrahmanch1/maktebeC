import React, { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { themes } from "../data/themes"; // Import themes to access their colors

const SettingsPage = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, isLoggedIn, token, setUser } = useContext(AuthContext);
  const [profileImage, setProfileImage] = useState(null);
  const [newUsername, setNewUsername] = useState(user ? user.username : "");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Common styles for consistency and new design
  const containerStyle = {
    backgroundColor: theme.background,
    color: theme.primary,
    padding: "40px 20px",
    minHeight: "calc(100vh - 100px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  const headerStyle = {
    color: theme.primary,
    textAlign: "center",
    marginBottom: "40px",
    fontSize: "3em",
    textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
  };

  const settingsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    maxWidth: "1200px",
    width: "100%",
  };

  const sectionCardStyle = {
    backgroundColor: theme.secondary,
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    
  };

  const sectionTitleStyle = {
    color: theme.background,
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "2.2em",
    borderBottom: `3px solid ${theme.accent}`,
    paddingBottom: "10px",
    width: "100%",
  };

  const itemGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "100%",
    maxWidth: "400px",
    marginTop: "20px",
  };

  const itemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: `1px solid ${theme.accent}40`,
    flexWrap: "wrap",
  };

  const labelStyle = {
    color: theme.primary,
    fontSize: "1.1em",
    fontWeight: "bold",
    flexBasis: "40%",
  };

  const valueStyle = {
    color: theme.primary,
    fontSize: "1.1em",
    flexBasis: "55%",
    textAlign: "right",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: `1px solid ${theme.accent}`,
    backgroundColor: theme.background,
    color: theme.primary,
    fontSize: "1em",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    backgroundColor: theme.accent,
    color: theme.primary,
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "1em",
    fontWeight: "bold",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    margin: "5px",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#dc3545",
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!profileImage) {
      alert("الرجاء اختيار صورة لرفعها.");
      return;
    }
    if (!isLoggedIn || !user || !user._id || !token) {
      alert("يجب تسجيل الدخول لرفع الصورة.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", profileImage);

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/users/${user._id}/profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser({ ...user, profilePicture: response.data.profilePicture });
      alert("تم تحديث الصورة الشخصية بنجاح!");
      setProfileImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("فشل تحميل الصورة الشخصية:", error);
      alert("فشل تحميل الصورة الشخصية. الرجاء المحاولة مرة أخرى.");
    }
  };

  const handleUsernameUpdate = async () => {
    if (!isLoggedIn || !user || !user._id || !token) {
      alert("يجب تسجيل الدخول لتعديل اسم المستخدم.");
      return;
    }
    if (newUsername.trim() === "") {
      alert("اسم المستخدم لا يمكن أن يكون فارغًا.");
      return;
    }
    if (newUsername === user.username) {
      alert("اسم المستخدم الجديد هو نفس الاسم الحالي.");
      setIsEditingUsername(false);
      return;
    }

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/users/${user._id}`,
        { username: newUsername },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser({ ...user, username: response.data.username });
      alert("تم تحديث اسم المستخدم بنجاح!");
      setIsEditingUsername(false);
    } catch (error) {
      console.error("فشل تحديث اسم المستخدم:", error);
      alert("فشل تحديث اسم المستخدم. الرجاء المحاولة مرة أخرى.");
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>إعدادات التطبيق</h1>
      <div style={settingsGridStyle}>

        {/* Account Settings Section */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>إعدادات الحساب</h2>
          <div style={itemGroupStyle}>
            <div style={itemStyle}>
              <span style={labelStyle}>اسم المستخدم:</span>
              {isEditingUsername ? (
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={inputStyle}
                />
              ) : (
                <span style={valueStyle}>{user ? user.username : "غير متاح"}</span>
              )}
              <button
                type="button"
                onClick={() => {
                  if (isEditingUsername) {
                    handleUsernameUpdate();
                  } else {
                    setIsEditingUsername(true);
                  }
                }}
                style={buttonStyle}
              >
                {isEditingUsername ? "حفظ" : "تعديل"}
              </button>
            </div>
            <div style={itemStyle}>
              <span style={labelStyle}>البريد الإلكتروني:</span>
              <span style={valueStyle}>{user ? `${user.email.substring(0, 2)}***` : "غير متاح"}</span>
            </div>
            <div style={{ ...itemStyle, flexDirection: "column", alignItems: "center" }}>
              <label style={{ ...labelStyle, flexBasis: "100%", marginBottom: "10px" }}>الصورة الشخصية:</label>
              <img
                src={user && user.profilePicture ? `${process.env.REACT_APP_API_URL}/uploads/${user.profilePicture}` : "/imgs/user_avatar.png"}
                alt="الصورة الشخصية"
                style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "15px", border: `3px solid ${theme.accent}` }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                style={{ ...inputStyle, marginBottom: "10px" }}
              />
              <button type="button" onClick={handleImageUpload} style={buttonStyle}>
                رفع الصورة
              </button>
            </div>
            <button type="button" onClick={() => alert("سيتم توجيهك لصفحة تغيير كلمة المرور.")} style={buttonStyle}>
              تغيير كلمة المرور
            </button>
            <button type="button" onClick={() => alert("تفعيل المصادقة الثنائية")} style={buttonStyle}>
              تفعيل المصادقة الثنائية
            </button>
            <button type="button" onClick={() => alert("حذف أو تعطيل الحساب")} style={dangerButtonStyle}>
              حذف أو تعطيل الحساب
            </button>
          </div>
        </div>

        {/* Appearance/Theme Settings */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>إعدادات المظهر</h2>
          <div style={itemGroupStyle}>
            <div style={itemStyle}>
              <span style={labelStyle}>تغيير الثيم:</span>
              <div style={{ flexBasis: "55%", textAlign: "right", display: "flex", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {Object.keys(themes).map((themeName) => (
                  <button
                    key={themeName}
                    onClick={() => toggleTheme(themeName)}
                    style={buttonStyle}
                  >
                    {themeName.replace("theme", "Theme ")}
                  </button>
                ))}
              </div>
            </div>
            <div style={itemStyle}>
              <span style={labelStyle}>ألوان واجهة الموقع:</span>
              <span style={valueStyle}> (لو فيه أكثر من ثيم)</span>
            </div>
            <div style={itemStyle}>
              <span style={labelStyle}>حجم الخط أو نوعه:</span>
              <span style={valueStyle}> (للقراءة)</span>
            </div>
          </div>
        </div>

        {/* Library Preferences */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>إعدادات المكتبة</h2>
          <div style={itemGroupStyle}>
            <div style={itemStyle}>
              <span style={labelStyle}>طريقة عرض الكتب:</span>
              <div style={{ flexBasis: "55%", textAlign: "right" }}>
                <button style={buttonStyle}>شبكة</button>
                <button style={buttonStyle}>قائمة</button>
              </div>
            </div>
            <div style={itemStyle}>
              <span style={labelStyle}>ترتيب الكتب:</span>
              <div style={{ flexBasis: "55%", textAlign: "right" }}>
                <button style={buttonStyle}>التاريخ</button>
                <button style={buttonStyle}>التقييم</button>
                <button style={buttonStyle}>الأبجدية</button>
              </div>
            </div>
            <div style={itemStyle}>
              <span style={labelStyle}>إشعارات الكتب الجديدة:</span>
              <input type="checkbox" style={{ ...inputStyle, width: "auto", flexBasis: "55%" }} />
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>إعدادات الإشعارات</h2>
          <div style={itemGroupStyle}>
            <div style={itemStyle}>
              <span style={labelStyle}>إشعارات إضافة كتب جديدة:</span>
              <input type="checkbox" style={{ ...inputStyle, width: "auto", flexBasis: "55%" }} />
            </div>
            <div style={itemStyle}>
              <span style={labelStyle}>إشعارات تخفيض سعر كتاب:</span>
              <input type="checkbox" style={{ ...inputStyle, width: "auto", flexBasis: "55%" }} />
            </div>
            <div style={itemStyle}>
              <span style={labelStyle}>إشعارات مراجعة كتاب:</span>
              <input type="checkbox" style={{ ...inputStyle, width: "auto", flexBasis: "55%" }} />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>إعدادات الخصوصية</h2>
          <div style={itemGroupStyle}>
            <div style={itemStyle}>
              <span style={labelStyle}>من يرى قائمة الكتب المفضلة:</span>
              <select style={{ ...inputStyle, flexBasis: "55%" }}>
                <option>الكل</option>
                <option>الأصدقاء</option>
                <option>أنا فقط</option>
              </select>
            </div>
            <div style={itemStyle}>
              <span style={labelStyle}>مزامنة القراءة مع الآخرين:</span>
              <input type="checkbox" style={{ ...inputStyle, width: "auto", flexBasis: "55%" }} />
            </div>
            <div style={itemStyle}>
              <span style={labelStyle}>مشاركة التعليقات/المراجعات:</span>
              <input type="checkbox" style={{ ...inputStyle, width: "auto", flexBasis: "55%" }} />
            </div>
          </div>
        </div>

        {/* Backup & Sync Settings */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>إعدادات النسخ الاحتياطي والمزامنة</h2>
          <div style={itemGroupStyle}>
            <div style={itemStyle}>
              <span style={labelStyle}>مزامنة المكتبة مع:</span>
              <div style={{ flexBasis: "55%", textAlign: "right" }}>
                <button style={buttonStyle}>Google Drive</button>
                <button style={buttonStyle}>Dropbox</button>
              </div>
            </div>
            <div style={itemStyle}>
              <span style={labelStyle}>تنزيل نسخة احتياطية:</span>
              <div style={{ flexBasis: "55%", textAlign: "right" }}>
                <button style={buttonStyle}>الكتب</button>
                <button style={buttonStyle}>الإعدادات</button>
              </div>
            </div>
          </div>
        </div>

        {/* Device Settings */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>إعدادات الأجهزة</h2>
          <div style={itemGroupStyle}>
            <div style={itemStyle}>
              <span style={labelStyle}>إدارة الأجهزة المرتبطة:</span>
              <button style={buttonStyle}>إدارة</button>
            </div>
            <div style={itemStyle}>
              <span style={labelStyle}>تسجيل الخروج من كل الأجهزة:</span>
              <button style={dangerButtonStyle}>تسجيل الخروج</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;