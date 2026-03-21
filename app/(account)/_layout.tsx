// ─── Account Route Guard ───────────────────────────────────────────────────────
// (account)/** altındaki tüm ekranlar için giriş zorunlu.
// Oturum yoksa kullanıcıyı /(auth)/login?redirect=<mevcut-sayfa>'ya yönlendirir.
import { Redirect, Stack, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../src/store/AuthContext";

const C = Colors.dark;

export default function AccountLayout() {
  const { user, isLoading } = useAuth();
  const pathname            = usePathname();

  // Auth durumu kontrol edilirken yüklenme göster
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  // Oturum yoksa login'e yönlendir (geri dönüş için mevcut rotayı aktar)
  if (!user) {
    return <Redirect href={`/(auth)/login?redirect=${encodeURIComponent(pathname)}`} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.background },
        animation: "slide_from_right",
      }}
    />
  );
}
