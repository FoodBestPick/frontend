import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LightTheme, DarkTheme } from "../core/constants/Colors";

export const ThemeContext = createContext({
  isDarkMode: false,
  theme: LightTheme,
  toggleDarkMode: (v: boolean) => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("darkMode");
      if (saved !== null) setIsDarkMode(saved === "true");
    })();
  }, []);

  const toggleDarkMode = async (v: boolean) => {
    setIsDarkMode(v);
    await AsyncStorage.setItem("darkMode", v.toString());
  };

  const theme = isDarkMode ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
