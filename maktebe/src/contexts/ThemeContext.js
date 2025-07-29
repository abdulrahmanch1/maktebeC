
import React, { createContext, useState, useMemo, useEffect } from "react";
import { themes } from "../data/themes";

export const ThemeContext = createContext({ toggleTheme: (themeName) => {}, theme: themes.theme1 });

export const ThemeProvider = ({ children }) => {
<<<<<<< HEAD
  const [theme, setTheme] = useState(themes.theme1);
=======
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? JSON.parse(savedTheme) : themes.theme1;
  });

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme));
  }, [theme]);
>>>>>>> 1188a9b (feat: Implement email verification for user registration)

  const toggleTheme = (themeName) => {
    setTheme(themes[themeName]);
  };

  const themeValues = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={themeValues}>
      {children}
    </ThemeContext.Provider>
  );
};
