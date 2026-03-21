// ─── Root Layout ──────────────────────────────────────────────────────────────
// SplashScreen: Auth durumu netleşene kadar native splash gösterilir.
// Auth hazır olunca hideAsync() çağrılır — beyaz ekran flash yok.
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { AuthProvider, useAuth } from "../src/store/AuthContext";
import { CartProvider } from "../src/store/CartContext";
import { FavoritesProvider } from "../src/store/FavoritesContext";
import { Colors } from "../constants/theme";

const C = Colors.dark;

// Native splash'ı JS hazır olana kadar tut
SplashScreen.preventAutoHideAsync();

// ── İç navigatör (Provider'ların içinde — hook'lar burada çalışır) ─────────────
function RootNavigator() {
  const { isLoading, user } = useAuth();
  useNotifications(user?.id ?? null);

  // Auth kontrolü bitti → splash'ı gizle
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Splash kapanana kadar boş döndür (native splash arkada gösteriyor)
  if (isLoading) return null;

  return (
    <Stack
      screenOptions={{
        headerShown:  false,
        contentStyle: { backgroundColor: C.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="odeme" options={{ headerShown: false, animation: "slide_from_bottom" }} />
    </Stack>
  );
}

// ── Root Layout (Provider Ağacı) ───────────────────────────────────────────────
export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <RootNavigator />
          <StatusBar style="light" />
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}
