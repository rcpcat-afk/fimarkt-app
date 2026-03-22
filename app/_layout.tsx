// ─── Root Layout ──────────────────────────────────────────────────────────────
// SplashScreen: Auth durumu netleşene kadar native splash gösterilir.
// Auth hazır olunca hideAsync() çağrılır — beyaz ekran flash yok.
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { useTheme } from "../hooks/useTheme";
import { AuthProvider, useAuth } from "../src/store/AuthContext";
import { CartProvider } from "../src/store/CartContext";
import { FavoritesProvider } from "../src/store/FavoritesContext";
import { ThemeProvider } from "../src/store/ThemeContext";

// Native splash'ı JS hazır olana kadar tut
SplashScreen.preventAutoHideAsync();

// ── İç navigatör (Provider'ların içinde — hook'lar burada çalışır) ─────────────
function RootNavigator() {
  const { isLoading, user } = useAuth();
  const { colors, isDark }  = useTheme();
  useNotifications(user?.id ?? null);

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown:  false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="odeme" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

// ── Root Layout (Provider Ağacı) ───────────────────────────────────────────────
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <RootNavigator />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
