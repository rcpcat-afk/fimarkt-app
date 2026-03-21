import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * CustomTabBar ile senkronize yükseklik.
 * Tab bar: 60px görsel yükseklik + cihazın safe area bottom.
 * ScrollView contentContainerStyle paddingBottom olarak kullan.
 */
export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  return 60 + Math.max(insets.bottom, 10);
}
