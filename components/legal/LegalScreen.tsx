import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { Stack } from "expo-router";
import { type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import type { LegalDoc } from "@/lib/content-manager";

interface Props { doc: LegalDoc }

export default function LegalScreen({ doc }: Props) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);
  const [activeId, setActiveId] = useState(doc.sections[0]?.id ?? "");

  return (
    <>
      <Stack.Screen options={{ title: doc.title }} />
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

        {/* ── Başlık ──────────────────────────────────────────────────── */}
        <View style={s.header}>
          <Text style={s.badge}>HUKUKİ BELGELER</Text>
          <Text style={s.title}>{doc.title}</Text>
          <Text style={s.lastUpdated}>Son güncelleme: {doc.lastUpdated}</Text>
        </View>

        {/* ── İçindekiler ─────────────────────────────────────────────── */}
        <View style={s.tocSection}>
          <Text style={s.tocTitle}>İçindekiler</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tocRow}>
            {doc.sections.map((sec) => (
              <TouchableOpacity
                key={sec.id}
                onPress={() => setActiveId(sec.id)}
                style={[s.tocBtn, activeId === sec.id && s.tocBtnActive]}
              >
                <Text style={[s.tocBtnText, activeId === sec.id && s.tocBtnTextActive]} numberOfLines={1}>
                  {sec.heading}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Belge İçeriği ────────────────────────────────────────────── */}
        <View style={s.content}>
          {doc.sections.map((sec) => (
            <View key={sec.id} style={s.section}>
              <Text style={s.sectionHeading}>{sec.heading}</Text>
              <Text style={s.sectionContent}>{sec.content}</Text>
            </View>
          ))}
        </View>

        {/* ── Alt Bilgi ───────────────────────────────────────────────── */}
        <View style={s.footer}>
          <Text style={s.footerTitle}>Fimarkt Teknoloji A.Ş.</Text>
          <Text style={s.footerText}>
            Mimarsinan OSB Mah. Teknoloji Cad. No:5, Melikgazi / Kayseri{"\n"}
            destek@fimarkt.com.tr
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </>
  );
}

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    container:        { flex: 1, backgroundColor: C.background },
    header:           { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
    badge:            { fontSize: 9, fontWeight: "800", color: C.accent, letterSpacing: 1.5, marginBottom: 6 },
    title:            { fontSize: 22, fontWeight: "900", color: C.foreground, marginBottom: 4 },
    lastUpdated:      { fontSize: 11, color: C.mutedForeground },
    tocSection:       { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
    tocTitle:         { fontSize: 9, fontWeight: "800", color: C.mutedForeground, letterSpacing: 1.2, paddingHorizontal: 20, marginBottom: 8 },
    tocRow:           { paddingHorizontal: 16, gap: 8 },
    tocBtn:           { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, maxWidth: 200 },
    tocBtnActive:     { backgroundColor: `${C.accent}18`, borderColor: `${C.accent}50` },
    tocBtnText:       { fontSize: 10, fontWeight: "600", color: C.mutedForeground },
    tocBtnTextActive: { color: C.accent },
    content:          { paddingHorizontal: 20, paddingTop: 20 },
    section:          { marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: C.border },
    sectionHeading:   { fontSize: 14, fontWeight: "700", color: C.foreground, marginBottom: 8 },
    sectionContent:   { fontSize: 12, color: C.mutedForeground, lineHeight: 20 },
    footer:           { marginHorizontal: 16, marginTop: 4, marginBottom: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16 },
    footerTitle:      { fontSize: 13, fontWeight: "700", color: C.foreground, marginBottom: 4 },
    footerText:       { fontSize: 11, color: C.mutedForeground, lineHeight: 18 },
  });
}
