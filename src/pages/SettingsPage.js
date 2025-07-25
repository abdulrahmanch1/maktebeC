
import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const SettingsPage = () => {
   const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px" }}>
      <h1 style={{ color: theme.primary, textAlign: "center" }}>الإعدادات</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        <div style={{ backgroundColor: theme.secondary, padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ color: theme.background, textAlign: "center" }}>إعدادات المظهر</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "15px" }}>
            <button
              onClick={() => toggleTheme("theme1")}
              style={{ backgroundColor: theme.accent, color: theme.primary }}
            >
              Theme 1
            </button>
            <button
              onClick={() => toggleTheme("theme2")}
              style={{ backgroundColor: theme.accent, color: theme.primary }}
            >
              Theme 2
            </button>
            <button
              onClick={() => toggleTheme("theme3")}
              style={{ backgroundColor: theme.accent, color: theme.primary }}
            >
              Theme 3
            </button>
            <button
              onClick={() => toggleTheme("theme4")}
              style={{ backgroundColor: theme.accent, color: theme.primary }}
            >
              Theme 4
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: theme.secondary, padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ color: theme.background, textAlign: "center" }}>إعدادات الحساب</h2>
          <form style={{ backgroundColor: "transparent", boxShadow: "none" }}>
            <input type="text" placeholder="اسم المستخدم" style={{ backgroundColor: theme.background, color: theme.primary, borderColor: theme.accent }} />
            <input type="email" placeholder="البريد الإلكتروني" style={{ backgroundColor: theme.background, color: theme.primary, borderColor: theme.accent }} />
            <input type="password" placeholder="كلمة المرور الجديدة" style={{ backgroundColor: theme.background, color: theme.primary, borderColor: theme.accent }} />
            <button type="submit" style={{ backgroundColor: theme.accent, color: theme.primary }}>حفظ التغييرات</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
