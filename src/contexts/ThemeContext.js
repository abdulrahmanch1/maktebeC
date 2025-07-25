
import React, { createContext, useState, useMemo } from "react";
import { themes } from "../data/themes";

export const ThemeContext = createContext({ toggleTheme: (themeName) => {}, theme: themes.theme1 });

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.theme1);

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
