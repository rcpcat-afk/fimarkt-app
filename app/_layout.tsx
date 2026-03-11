import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../src/store/AuthContext";
import { CartProvider } from "../src/store/CartContext";
import { FavoritesProvider } from "../src/store/FavoritesContext";

function RootNavigator() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0a0f",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#ff6b2b" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

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
