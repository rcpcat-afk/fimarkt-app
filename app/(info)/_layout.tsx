import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

export default function InfoLayout() {
  const { colors: C } = useTheme();
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
