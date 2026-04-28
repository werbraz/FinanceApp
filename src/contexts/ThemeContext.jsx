import { createContext, useContext, useState } from "react";
import { THEMES, DEFAULT_THEME_ID } from "../constants/themes";

const ThemeContext = createContext(THEMES[DEFAULT_THEME_ID]);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem("finapp_theme") || DEFAULT_THEME_ID
  );

  const theme = THEMES[themeId] ?? THEMES[DEFAULT_THEME_ID];

  const setTheme = (id) => {
    localStorage.setItem("finapp_theme", id);
    setThemeId(id);
  };

  return (
    <ThemeContext.Provider value={{ ...theme, themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
