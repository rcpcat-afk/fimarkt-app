// ─── [pillar] Grup Layout ─────────────────────────────────────────────────────
// app/[pillar]/_layout.tsx — [category] ve ilerleyen [category]/[slug] ekranları
// için Stack navigator tanımlar. headerShown: false — kendi header'ları var.
import { Stack } from "expo-router";

export default function PillarLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
