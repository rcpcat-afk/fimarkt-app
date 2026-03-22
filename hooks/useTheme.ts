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
import { useColorScheme } from "react-native";
import { Colors, type ThemeColors } from "../constants/theme";

interface UseThemeReturn {
  colors:  ThemeColors;
  isDark:  boolean;
  scheme:  "dark" | "light";
}

export function useTheme(): UseThemeReturn {
  const systemScheme = useColorScheme();
  // Sistem teması yoksa (simulator/web önizleme) dark'a düş
  const scheme: "dark" | "light" = systemScheme === "light" ? "light" : "dark";

  return {
    colors: Colors[scheme],
    isDark: scheme === "dark",
    scheme,
  };
}
