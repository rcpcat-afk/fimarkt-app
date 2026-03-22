// ─── (engineer) route grubu layout ───────────────────────────────────────────
// Ekranlar modal-stack gibi üstte açılır; (tabs) navigasyonu gizlenmez.
import { Stack } from "expo-router";

export default function EngineerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
