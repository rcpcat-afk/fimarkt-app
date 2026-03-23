import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, LayoutAnimation, Platform, UIManager,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { FAQ } from "@/lib/content-manager";

if (Platform.OS === "android") UIManager.setLayoutAnimationEnabledExperimental?.(true);

export default function SssScreen() {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);

  const router = useRouter();
  const [query,     setQuery]     = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [openKey,   setOpenKey]   = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q   = query.toLowerCase().trim();
    const cats = activeCat === "all" ? FAQ.categories : FAQ.categories.filter((c) => c.id === activeCat);
    return cats
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) => !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query, activeCat]);

  const toggle = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <>
      <Stack.Screen options={{ title: "SSS" }} />
      <ScrollView style={s.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Arama ──────────────────────────────────────────────────── */}
        <View style={s.searchSection}>
          <Text style={s.pageTitle}>Sıkça Sorulan Sorular</Text>
          <View style={s.searchBox}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Sorunuzu yazın..."
              placeholderTextColor={C.mutedForeground}
              style={s.searchInput}
            />
          </View>
        </View>

        {/* ── Kategori sekmeleri ──────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catsRow}>
          {[{ id: "all", icon: "🔍", label: "Tümü" }, ...FAQ.categories].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveCat(cat.id)}
              style={[s.catBtn, activeCat === cat.id && s.catBtnActive]}
            >
              <Text style={[s.catBtnText, activeCat === cat.id && s.catBtnTextActive]}>
                {cat.icon} {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Akordeon ────────────────────────────────────────────────── */}
        <View style={s.list}>
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🔍</Text>
              <Text style={s.emptyText}>"{query}" için sonuç bulunamadı.</Text>
            </View>
          ) : (
            filtered.map((cat) => (
              <View key={cat.id} style={s.catGroup}>
                <Text style={s.catHeader}>{cat.icon} {cat.label}</Text>
                {cat.items.map((item) => {
                  const key    = `${cat.id}-${item.q}`;
                  const isOpen = openKey === key;
                  return (
                    <View key={key} style={s.accordionItem}>
                      <TouchableOpacity style={s.accordionQ} onPress={() => toggle(key)} activeOpacity={0.8}>
                        <Text style={s.accordionQText}>{item.q}</Text>
                        <Text style={[s.accordionChevron, isOpen && { color: C.accent }]}>
                          {isOpen ? "▲" : "▼"}
                        </Text>
                      </TouchableOpacity>
                      {isOpen && (
                        <View style={s.accordionA}>
                          <View style={s.accordionDivider} />
                          <Text style={s.accordionAText}>{item.a}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </View>

        {/* ── Alt yönlendirme ─────────────────────────────────────────── */}
        <TouchableOpacity
          style={s.ctaBanner}
          onPress={() => router.push("/(info)/iletisim" as any)}
          activeOpacity={0.88}
        >
          <Text style={s.ctaEmoji}>💬</Text>
          <Text style={s.ctaTitle}>Hâlâ sorunuz mu var?</Text>
          <Text style={s.ctaSub}>Müşteri hizmetlerimize ulaşın →</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </>
  );
}

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    container:          { flex: 1, backgroundColor: C.background },
    searchSection:      { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.surface },
    pageTitle:          { fontSize: 22, fontWeight: "900", color: C.foreground, marginBottom: 12 },
    searchBox:          { flexDirection: "row", alignItems: "center", backgroundColor: C.background, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 12 },
    searchIcon:         { fontSize: 16, marginRight: 8 },
    searchInput:        { flex: 1, height: 44, fontSize: 13, color: C.foreground },
    catsRow:            { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    catBtn:             { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    catBtnActive:       { backgroundColor: C.accent, borderColor: C.accent },
    catBtnText:         { fontSize: 12, fontWeight: "600", color: C.mutedForeground },
    catBtnTextActive:   { color: "#fff" },
    list:               { paddingHorizontal: 16, paddingTop: 8 },
    empty:              { alignItems: "center", paddingVertical: 40 },
    emptyIcon:          { fontSize: 36, marginBottom: 8 },
    emptyText:          { fontSize: 13, color: C.mutedForeground },
    catGroup:           { marginBottom: 20 },
    catHeader:          { fontSize: 10, fontWeight: "800", color: C.mutedForeground, letterSpacing: 1.2, marginBottom: 8, textTransform: "uppercase" },
    accordionItem:      { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, marginBottom: 8, overflow: "hidden" },
    accordionQ:         { flexDirection: "row", alignItems: "center", padding: 14, gap: 8 },
    accordionQText:     { flex: 1, fontSize: 13, fontWeight: "600", color: C.foreground, lineHeight: 18 },
    accordionChevron:   { fontSize: 9, color: C.mutedForeground },
    accordionA:         { paddingHorizontal: 14, paddingBottom: 14 },
    accordionDivider:   { height: 1, backgroundColor: C.border, marginBottom: 10 },
    accordionAText:     { fontSize: 12, color: C.mutedForeground, lineHeight: 19 },
    ctaBanner:          { margin: 16, borderRadius: 20, borderWidth: 1, borderColor: `${C.accent}30`, backgroundColor: `${C.accent}10`, padding: 20, alignItems: "center" },
    ctaEmoji:           { fontSize: 28, marginBottom: 6 },
    ctaTitle:           { fontSize: 15, fontWeight: "800", color: C.foreground, marginBottom: 4 },
    ctaSub:             { fontSize: 12, color: C.accent, fontWeight: "600" },
  });
}
