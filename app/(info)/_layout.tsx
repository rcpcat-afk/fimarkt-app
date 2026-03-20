import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";

const C = Colors.dark;

export default function InfoLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle:       { backgroundColor: C.background },
        headerTintColor:   C.foreground,
        headerTitleStyle:  { fontWeight: "700", fontSize: 16 },
        headerShadowVisible: false,
        headerBackTitle:   "Geri",
        contentStyle:      { backgroundColor: C.background },
      }}
    />
  );
}
