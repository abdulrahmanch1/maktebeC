
import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const ComplaintsPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px" ,height: "80vh"}}>
      <h1 style={{ color: theme.primary, textAlign: "center" }}>صفحة الشكاوى</h1>
      <form style={{ backgroundColor: theme.secondary, color: theme.background  }}>
        <textarea
          placeholder="اكتب شكواك هنا..."
          rows="8"
          style={{ backgroundColor: theme.background, color: theme.primary, borderColor: theme.accent }}
        ></textarea>
        <button type="submit" style={{ backgroundColor: theme.accent, color: theme.primary }}>إرسال الشكوى</button>
      </form>
    </div>
  );
};

export default ComplaintsPage;
