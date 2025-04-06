import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext({});

export function ThemeContextProvider({ children }) {
  // Initialize with null, then set based on localStorage in useEffect
  const [darkMode, setDarkMode] = useState(() => {
    // Try to get saved preference from localStorage during initialization
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Update local storage and apply/remove dark class when darkMode changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
