import { useRef, type ReactNode } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

// ── Tab definitions ────────────────────────────────────────────────────────────
type TabConfig = {
  label: string;
  icon:  (active: boolean, accent: string, muted: string) => ReactNode;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  dashboard: {
    label: "Komuta",
    icon:  (a, ac, mu) => (
      <Ionicons name={a ? "flash" : "flash-outline"} size={22} color={a ? ac : mu} />
    ),
  },
  inventory: {
    label: "Ürünlerim",
    icon:  (a, ac, mu) => (
      <Ionicons name={a ? "storefront" : "storefront-outline"} size={22} color={a ? ac : mu} />
    ),
  },
  orders: {
    label: "Siparişler",
    icon:  (a, ac, mu) => (
      <Ionicons name={a ? "cube" : "cube-outline"} size={22} color={a ? ac : mu} />
    ),
  },
  finance: {
    label: "Finans",
    icon:  (a, ac, mu) => (
      <Ionicons name={a ? "cash" : "cash-outline"} size={22} color={a ? ac : mu} />
    ),
  },
  messages: {
    label: "Mesajlar",
    icon:  (a, ac, mu) => (
      <Ionicons name={a ? "chatbubbles" : "chatbubbles-outline"} size={22} color={a ? ac : mu} />
    ),
  },
};

const VISIBLE_ORDER = ["dashboard", "inventory", "orders", "finance", "messages"];

export default function SellerTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const scales = useRef(
    VISIBLE_ORDER.reduce<Record<string, Animated.Value>>((acc, name) => {
      acc[name] = new Animated.Value(1);
      return acc;
    }, {})
  ).current;

  const handlePress = (routeName: string, isFocused: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scales[routeName], { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(scales[routeName], { toValue: 1, bounciness: 10, useNativeDriver: true }),
    ]).start();
    if (!isFocused) {
      navigation.navigate(routeName);
    }
  };

  const focusedRoute = state.routes[state.index]?.name ?? "";
  const safeBottom   = Math.max(insets.bottom, 10);
  const BAR_HEIGHT   = 60 + safeBottom;

  return (
    <View style={[s.container, { height: BAR_HEIGHT }]}>
      {/* Glassmorphism background */}
      {Platform.OS === "ios" ? (
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background + "F0" }]} />
      )}

      {/* Top border */}
      <View style={[s.topBorder, { backgroundColor: colors.border }]} />

      {/* Tab items */}
      <View style={[s.tabRow, { paddingBottom: safeBottom }]}>
        {VISIBLE_ORDER.map((routeName) => {
          const config    = TAB_CONFIG[routeName];
          const isFocused = focusedRoute === routeName;
          if (!config) return null;

          return (
            <Pressable
              key={routeName}
              onPress={() => handlePress(routeName, isFocused)}
              style={s.tabItem}
              android_ripple={{ color: colors.accent + "33", borderless: true }}
            >
              <Animated.View
                style={[s.tabInner, { transform: [{ scale: scales[routeName] ?? new Animated.Value(1) }] }]}
              >
                {config.icon(isFocused, colors.accent, colors.subtleForeground)}
                <Text
                  style={[
                    s.tabLabel,
                    { color: isFocused ? colors.accent : colors.subtleForeground },
                    isFocused && s.tabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {config.label}
                </Text>
                {isFocused && (
                  <View style={[s.activeDot, { backgroundColor: colors.accent }]} />
                )}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: "absolute",
    bottom:   0,
    left:     0,
    right:    0,
    overflow: "visible",
  },
  topBorder: {
    position: "absolute",
    top:      0,
    left:     0,
    right:    0,
    height:   1,
  },
  tabRow: {
    flex:              1,
    flexDirection:     "row",
    alignItems:        "flex-end",
    paddingHorizontal: 4,
  },
  tabItem: {
    flex:           1,
    alignItems:     "center",
    justifyContent: "center",
    paddingTop:     10,
    paddingBottom:  4,
  },
  tabInner: {
    alignItems: "center",
    gap:        3,
    position:   "relative",
  },
  tabLabel: {
    fontSize:      10,
    fontWeight:    "600",
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    fontWeight: "800",
  },
  activeDot: {
    position:     "absolute",
    bottom:       -6,
    width:        4,
    height:       4,
    borderRadius: 2,
    alignSelf:    "center",
  },
});
