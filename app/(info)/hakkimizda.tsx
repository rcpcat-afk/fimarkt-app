import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, Dimensions, Animated,
} from "react-native";
import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";
import { ABOUT } from "@/lib/content-manager";

const { width } = Dimensions.get("window");
const C = Colors.dark;

// ── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const anim   = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value,
      duration: 1400,
      useNativeDriver: false,
    }).start();
    const listener = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => anim.removeListener(listener);
  }, [value]);

  return (
    <View style={s.statItem}>
      <Text style={s.statValue}>{display}{suffix}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export default function HakkimizdaScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Hakkımızda" }} />
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

        {/* ── 1. HERO ────────────────────────────────────────────────── */}
        <View style={s.heroSection}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>{ABOUT.hero.badge}</Text>
          </View>
          <Text style={s.heroTitle}>{ABOUT.hero.title}</Text>
          <Text style={s.heroSub}>{ABOUT.hero.subtitle}</Text>
        </View>

        {/* ── 2. RAKAMLAR ────────────────────────────────────────────── */}
        <View style={s.statsSection}>
          {ABOUT.stats.map((stat) => (
            <Counter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
          ))}
        </View>

        {/* ── 3. HİKAYEMİZ ───────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionBadge}>HİKAYEMİZ</Text>
          <Text style={s.sectionTitle}>Garaj Atölyesinden Ekosisteme</Text>
          {ABOUT.story.split("\n\n").map((p, i) => (
            <Text key={i} style={s.bodyText}>{p}</Text>
          ))}
          <Text style={s.locationText}>📍 {ABOUT.location} · {ABOUT.founded}</Text>
        </View>

        {/* ── 4. VİZYON & MİSYON ─────────────────────────────────────── */}
        <View style={s.section}>
          {[
            { icon: "🔭", label: "Vizyonumuz", text: ABOUT.vision,  color: "#7c3aed" },
            { icon: "🎯", label: "Misyonumuz", text: ABOUT.mission, color: "#0ea5e9" },
          ].map((item) => (
            <View key={item.label} style={[s.vmCard, { backgroundColor: `${item.color}10`, borderColor: `${item.color}30` }]}>
              <Text style={s.vmIcon}>{item.icon}</Text>
              <Text style={[s.vmLabel, { color: item.color }]}>{item.label}</Text>
              <Text style={s.vmText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* ── 5. DEĞERLERİMİZ ─────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionBadge}>DEĞERLERİMİZ</Text>
          <View style={s.valuesGrid}>
            {ABOUT.values.map((v) => (
              <View key={v.title} style={s.valueCard}>
                <Text style={s.valueIcon}>{v.icon}</Text>
                <Text style={s.valueTitle}>{v.title}</Text>
                <Text style={s.valueDesc}>{v.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: C.background },

  // Hero
  heroSection:    { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: C.border },
  heroBadge:      { alignSelf: "flex-start", backgroundColor: `${C.accent}18`, borderWidth: 1, borderColor: `${C.accent}40`, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  heroBadgeText:  { fontSize: 10, fontWeight: "700", color: C.accent },
  heroTitle:      { fontSize: 24, fontWeight: "900", color: C.foreground, letterSpacing: -0.5, marginBottom: 8 },
  heroSub:        { fontSize: 13, color: C.mutedForeground, lineHeight: 20 },

  // Stats
  statsSection:   { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.surface },
  statItem:       { width: "50%", alignItems: "center", paddingVertical: 12 },
  statValue:      { fontSize: 28, fontWeight: "900", color: C.accent, marginBottom: 2 },
  statLabel:      { fontSize: 11, color: C.mutedForeground },

  // Sections
  section:        { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  sectionBadge:   { fontSize: 9, fontWeight: "800", color: C.accent, letterSpacing: 1.5, marginBottom: 6 },
  sectionTitle:   { fontSize: 18, fontWeight: "900", color: C.foreground, marginBottom: 12 },
  bodyText:       { fontSize: 13, color: C.mutedForeground, lineHeight: 21, marginBottom: 10 },
  locationText:   { fontSize: 11, color: C.subtleForeground, marginTop: 4 },

  // Vizyon & Misyon
  vmCard:         { borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 10 },
  vmIcon:         { fontSize: 28, marginBottom: 6 },
  vmLabel:        { fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 6 },
  vmText:         { fontSize: 12, color: C.mutedForeground, lineHeight: 19 },

  // Değerler
  valuesGrid:     { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  valueCard:      { width: (width - 50) / 2, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 14 },
  valueIcon:      { fontSize: 24, marginBottom: 6 },
  valueTitle:     { fontSize: 13, fontWeight: "700", color: C.foreground, marginBottom: 4 },
  valueDesc:      { fontSize: 10, color: C.mutedForeground, lineHeight: 15 },
});
