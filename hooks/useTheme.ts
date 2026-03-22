// ─── useTheme Hook ────────────────────────────────────────────────────────────
// Bölüm 6+ tüm yeni ekranlar bu hook'u kullanır.
// StyleSheet.create() bileşen içinde useMemo ile çağrılmalıdır:
//
//   const { colors } = useTheme();
//   const styles = useMemo(() => StyleSheet.create({
//     container: { backgroundColor: colors.background },
//   }), [colors]);
//
// Eski ekranlar dokunulduğunda (izci kuralı) bu sisteme migrate edilir.
import { Colors, type ThemeColors } from "../constants/theme";
import { useThemeContext } from "../src/store/ThemeContext";

interface UseThemeReturn {
  colors:      ThemeColors;
  isDark:      boolean;
  scheme:      "dark" | "light";
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  const { scheme, isDark, toggleTheme } = useThemeContext();

  return {
    colors: Colors[scheme],
    isDark,
    scheme,
    toggleTheme,
  };
}
