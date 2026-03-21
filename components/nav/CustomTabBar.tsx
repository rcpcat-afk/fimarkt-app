import { useState, useRef, type ReactNode } from "react";
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
import { Colors } from "../../constants/theme";
import FidropActionSheet from "./FidropActionSheet";

const C = Colors.dark;

// ── Tab definitions ───────────────────────────────────────────────────────────
// Maps route name → display config
const TAB_CONFIG: Record<string, {
  label: string;
  icon: (active: boolean) => ReactNode;
}> = {
  index: {
    label: "Ana Sayfa",
    icon: (a) => (
      <Ionicons
        name={a ? "home" : "home-outline"}
        size={22}
        color={a ? C.accent : C.subtleForeground}
      />
    ),
  },
  sanatkat: {
    label: "Sanatkat",
    icon: (a) => (
      <Ionicons
        name={a ? "color-palette" : "color-palette-outline"}
        size={22}
        color={a ? C.accent : C.subtleForeground}
      />
    ),
  },
  // "print" is the center Fidrop button — rendered separately
  print: {
    label: "Fidrop",
    icon: () => null,
  },
  orders: {
    label: "Siparişler",
    icon: (a) => (
      <Ionicons
        name={a ? "cube" : "cube-outline"}
        size={22}
        color={a ? C.accent : C.subtleForeground}
      />
    ),
  },
  profile: {
    label: "Profil",
    icon: (a) => (
      <Ionicons
        name={a ? "person-circle" : "person-circle-outline"}
        size={22}
        color={a ? C.accent : C.subtleForeground}
      />
    ),
  },
};

// Tabs rendered in the bar (admin excluded — controlled by _layout href:null)
const VISIBLE_ORDER = ["index", "sanatkat", "print", "orders", "profile"];

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets  = useSafeAreaInsets();
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  // Scale animation refs per tab for press feedback
  const scales = useRef(
    VISIBLE_ORDER.reduce<Record<string, Animated.Value>>((acc, name) => {
      acc[name] = new Animated.Value(1);
      return acc;
    }, {})
  ).current;

  const handlePress = (routeName: string, isFocused: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Center button → open action sheet, don't navigate
    if (routeName === "print") {
      // Pulse animation on the center button
      Animated.sequence([
        Animated.timing(scales[routeName], { toValue: 0.88, duration: 100, useNativeDriver: true }),
        Animated.spring(scales[routeName], { toValue: 1, bounciness: 12, useNativeDriver: true }),
      ]).start();
      setActionSheetVisible(true);
      return;
    }

    // Normal tab press animation
    Animated.sequence([
      Animated.timing(scales[routeName], { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(scales[routeName], { toValue: 1, bounciness: 10, useNativeDriver: true }),
    ]).start();

    if (!isFocused) {
      navigation.navigate(routeName);
    }
  };

  // Find the currently focused route name
  const focusedRoute = state.routes[state.index]?.name ?? "";

  // Minimum 10px bottom padding — protects against old Android devices
  // where insets.bottom === 0 but icons still need breathing room
  const safeBottom = Math.max(insets.bottom, 10);
  const BAR_HEIGHT = 60 + safeBottom;

  return (
    <>
      <View style={[s.container, { height: BAR_HEIGHT }]}>
        {/* Glassmorphism background */}
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          // Android fallback: semi-transparent surface
          <View style={[StyleSheet.absoluteFill, { backgroundColor: C.background + "F0" }]} />
        )}

        {/* Top border */}
        <View style={[s.topBorder, { backgroundColor: C.border }]} />

        {/* Tab items */}
        <View style={[s.tabRow, { paddingBottom: safeBottom }]}>
          {VISIBLE_ORDER.map((routeName) => {
            const config    = TAB_CONFIG[routeName];
            const isFocused = focusedRoute === routeName;
            const isCenter  = routeName === "print";

            if (isCenter) {
              // ── Floating center button ──────────────────────────────────
              return (
                <View key={routeName} style={s.centerWrapper}>
                  <Animated.View style={{ transform: [{ scale: scales[routeName] }] }}>
                    <Pressable
                      onPress={() => handlePress(routeName, isFocused)}
                      style={s.centerBtn}
                      android_ripple={{ color: C.accent + "44", borderless: true }}
                    >
                      {/* Glow ring */}
                      <View style={s.centerGlow} />
                      {/* Button */}
                      <View style={[s.centerInner, { backgroundColor: C.accent }]}>
                        <Ionicons name="rocket" size={26} color="#fff" />
                      </View>
                    </Pressable>
                  </Animated.View>
                  <Text style={[s.centerLabel, { color: C.subtleForeground }]}>Fidrop</Text>
                </View>
              );
            }

            // ── Regular tab ──────────────────────────────────────────────
            return (
              <Pressable
                key={routeName}
                onPress={() => handlePress(routeName, isFocused)}
                style={s.tabItem}
                android_ripple={{ color: C.accent + "33", borderless: true }}
              >
                <Animated.View
                  style={[s.tabInner, { transform: [{ scale: scales[routeName] }] }]}
                >
                  {config.icon(isFocused)}
                  <Text
                    style={[
                      s.tabLabel,
                      { color: isFocused ? C.accent : C.subtleForeground },
                      isFocused && s.tabLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {config.label}
                  </Text>
                  {/* Active dot */}
                  {isFocused && (
                    <View style={[s.activeDot, { backgroundColor: C.accent }]} />
                  )}
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Fidrop Action Sheet */}
      <FidropActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
      />
    </>
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
    flex:           1,
    flexDirection:  "row",
    alignItems:     "flex-end",
    paddingHorizontal: 4,
  },

  // Regular tab
  tabItem: {
    flex:            1,
    alignItems:      "center",
    justifyContent:  "center",
    paddingTop:      10,
    paddingBottom:   4,
  },
  tabInner: {
    alignItems:   "center",
    gap:          3,
    position:     "relative",
  },
  tabLabel: {
    fontSize:   10,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    fontWeight: "800",
  },
  activeDot: {
    position:    "absolute",
    bottom:      -6,
    width:       4,
    height:      4,
    borderRadius: 2,
    alignSelf:   "center",
  },

  // Center Fidrop button
  centerWrapper: {
    flex:           1,
    alignItems:     "center",
    justifyContent: "flex-end",
    paddingBottom:  6,
  },
  centerBtn: {
    alignItems:     "center",
    justifyContent: "center",
    marginBottom:   2,
  },
  centerGlow: {
    position:    "absolute",
    width:       68,
    height:      68,
    borderRadius: 34,
    backgroundColor: "#ff6b2b33",
  },
  centerInner: {
    width:        56,
    height:       56,
    borderRadius: 28,
    alignItems:   "center",
    justifyContent: "center",
    shadowColor:  "#ff6b2b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation:    10,
  },
  centerLabel: {
    fontSize:   9,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
