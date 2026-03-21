// ─── Ödeme Grubu Layout ───────────────────────────────────────────────────────
// odeme/index, odeme/basarili, odeme/hata — hepsi tab bar'sız tam ekran Stack
import { Stack } from "expo-router";

export default function OdemeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"    options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="basarili" options={{ animation: "fade" }} />
      <Stack.Screen name="hata"     options={{ animation: "fade" }} />
    </Stack>
  );
}
