// ─── (seller) Route Group Layout ─────────────────────────────────────────────
// Satıcı ekranları: onboarding + lite panel.
// URL'ye (seller) prefix eklenmez — Expo Router route group.
import { Stack } from "expo-router";

export default function SellerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
