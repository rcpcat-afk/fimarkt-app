// ─── ThemeContext ─────────────────────────────────────────────────────────────
// Kullanıcının tema tercihini AsyncStorage'da saklar.
// - İlk açılışta sistem temasını okur.
// - Kullanıcı override ederse fimarkt_theme key'e yazar.
// - toggleTheme() her yerden çağrılabilir.
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type Scheme = "dark" | "light";

interface ThemeContextValue {
  scheme:      Scheme;
  isDark:      boolean;
  toggleTheme: () => void;
}

const STORAGE_KEY = "fimarkt_theme";

const ThemeContext = createContext<ThemeContextValue>({
  scheme:      "dark",
  isDark:      true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [scheme, setScheme] = useState<Scheme>(systemScheme === "light" ? "light" : "dark");

  // AsyncStorage'dan kaydedilmiş tercihi oku
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") {
        setScheme(stored);
      }
    });
  }, []);

  const toggleTheme = () => {
    const next: Scheme = scheme === "dark" ? "light" : "dark";
    setScheme(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ scheme, isDark: scheme === "dark", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
