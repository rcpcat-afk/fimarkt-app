import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { type ThemeColors } from "@/constants/theme";
import BentoBanners from "@/components/home/BentoBanners";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";

const { width } = Dimensions.get("window");

// ── Mock veri — gerçek API'ler ilgili bölümde bağlanacak ─────────────────────
const ORDER_STEPS   = ["Alındı", "Onaylandı", "Üretimde", "Kargoda", "Teslim"];
const MOCK_ORDER    = { id: "FM-2024-001", stepIndex: 2, product: "Apollo Heykeli × 1" };
const MOCK_RECS     = [
  { emoji: "🧵", name: "PLA Filament",   price: "285₺",   tag: ""        },
  { emoji: "🏛️", name: "Apollo Heykeli", price: "4.955₺", tag: "Popüler" },
  { emoji: "⚙️", name: "Nozzle Seti",    price: "145₺",   tag: "Yeni"    },
  { emoji: "🐺", name: "Anubis Figürü",  price: "2.850₺", tag: ""        },
];
const MOCK_ACTIVITY = [
  { icon: "📋", text: "3D baskı teklifi taslağı",                sub: "Henüz tamamlanmadı" },
  { icon: "🏛️", text: "Apollo Heykeli sayfasını ziyaret ettin",  sub: "2 saat önce"        },
  { icon: "📦", text: "FM-2024-001 siparişi Üretimde",            sub: "Dün"                },
];
const QUICK_ACTIONS = [
  { emoji: "➕", label: "Yeni Baskı",   sub: "STL yükle",       href: "/(tabs)/print" as const, color: "#ff6b2b" },
  { emoji: "❤️", label: "Favoriler",    sub: "Kaydettiğin",     href: "/(account)/favorites" as any, color: "#ec4899" },
  { emoji: "🧭", label: "Keşfet",       sub: "Yeni ürünler",    href: "/(tabs)/shop" as const,  color: "#3b82f6" },
];

interface Props { userName: string; userRole?: string }

export default function UserHome({ userName, userRole }: Props) {
  const { colors: C } = useTheme();
  const router       = useRouter();
  const tabBarHeight = useTabBarHeight();
  const s         = makeStyles(C);
  const [greeting, setGreeting] = useState("Hoş geldin");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12)      setGreeting("Günaydın");
    else if (h < 18) setGreeting("İyi günler");
    else             setGreeting("İyi akşamlar");
  }, []);

  const firstName = userName.split(" ")[0];
  const initials  = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const progress  = (MOCK_ORDER.stepIndex / (ORDER_STEPS.length - 1)) * 100;

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight }}>

      {/* ── 1. WELCOME BOARD ──────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(400)} style={s.welcomeRow}>
        <View>
          <Text style={s.greetingText}>{greeting},</Text>
          <Text style={s.nameText}>{firstName} 👋</Text>
          {userRole && (
            <View style={s.roleBadge}>
              <Text style={s.roleBadgeText}>{userRole}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={s.avatar} onPress={() => router.push("/(account)/personal-info" as any)}>
          <Text style={s.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── 1b. KİŞİSELLEŞTİRİLMİŞ KAMPANYALAR ──────────────────── */}
      <BentoBanners userRole={userRole} />

      {/* ── 2. AKTİF SİPARİŞ ─────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={s.orderCard}>
        <View style={s.orderHeader}>
          <Text style={s.orderHeaderText}>📦 Aktif Sipariş</Text>
          <Text style={s.orderIdText}>#{MOCK_ORDER.id}</Text>
        </View>
        <Text style={s.orderProduct}>{MOCK_ORDER.product}</Text>

        {/* Step göstergesi */}
        <View style={s.stepsRow}>
          {ORDER_STEPS.map((step, i) => (
            <View key={step} style={s.stepCol}>
              <View style={[
                s.stepCircle,
                i < MOCK_ORDER.stepIndex  ? s.stepDone
                : i === MOCK_ORDER.stepIndex ? s.stepActive
                : s.stepPending,
              ]}>
                <Text style={s.stepCircleText}>{i < MOCK_ORDER.stepIndex ? "✓" : String(i + 1)}</Text>
              </View>
              <Text style={s.stepLabel} numberOfLines={1}>{step}</Text>
            </View>
          ))}
        </View>

        {/* İlerleme çubuğu */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress}%` as any }]} />
        </View>
        <Text style={s.progressLabel}>{ORDER_STEPS[MOCK_ORDER.stepIndex]}</Text>

        <TouchableOpacity style={s.orderBtn} onPress={() => router.push("/(account)/personal-info" as any)}>
          <Text style={s.orderBtnText}>Sipariş Detayı →</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── 3. HIZLI AKSİYONLAR ──────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(140).duration(400)} style={s.section}>
        <Text style={s.sectionTitle}>Hızlı Aksiyonlar</Text>
        <View style={s.actionsRow}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.href}
              style={[s.actionCard, { borderColor: `${a.color}40`, backgroundColor: `${a.color}12` }]}
              onPress={() => router.push(a.href)}
              activeOpacity={0.8}
            >
              <Text style={s.actionEmoji}>{a.emoji}</Text>
              <Text style={[s.actionLabel, { color: a.color }]}>{a.label}</Text>
              <Text style={s.actionSub}>{a.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* ── 4. ÖNERİLER ──────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={s.section}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>✨ Senin İçin Seçtiklerimiz</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/shop")}>
            <Text style={s.sectionMore}>Tümü →</Text>
          </TouchableOpacity>
        </View>
        <View style={s.recsGrid}>
          {MOCK_RECS.map((p, i) => (
            <TouchableOpacity key={i} style={s.recCard} activeOpacity={0.85}>
              <View style={s.recImg}><Text style={s.recEmoji}>{p.emoji}</Text></View>
              <View style={s.recInfo}>
                {p.tag ? <Text style={s.recTag}>{p.tag}</Text> : null}
                <Text style={s.recName} numberOfLines={2}>{p.name}</Text>
                <Text style={s.recPrice}>{p.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* ── 5. SON AKTİVİTE ──────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(260).duration(400)} style={[s.section, { marginBottom: 24 }]}>
        <Text style={s.sectionTitle}>🕐 Son Aktivite</Text>
        {MOCK_ACTIVITY.map((item, i) => (
          <View key={i} style={s.activityItem}>
            <Text style={s.activityIcon}>{item.icon}</Text>
            <View style={s.activityBody}>
              <Text style={s.activityText} numberOfLines={1}>{item.text}</Text>
              <Text style={s.activitySub}>{item.sub}</Text>
            </View>
            <Text style={s.activityChevron}>›</Text>
          </View>
        ))}
      </Animated.View>

    </ScrollView>
  );
}

// ── Dinamik stiller ───────────────────────────────────────────────────────────
function makeStyles(C: ThemeColors) {
  return StyleSheet.create({
    container:       { flex: 1, backgroundColor: C.background },

    // Welcome
    welcomeRow:      { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 4 },
    greetingText:    { fontSize: 12, color: C.mutedForeground },
    nameText:        { fontSize: 24, fontWeight: "900", color: C.foreground },
    roleBadge:       { alignSelf: "flex-start", marginTop: 4, backgroundColor: `${C.accent}18`, borderWidth: 1, borderColor: `${C.accent}35`, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
    roleBadgeText:   { fontSize: 9, fontWeight: "700", color: C.accent, textTransform: "capitalize" },
    avatar:          { width: 44, height: 44, borderRadius: 22, backgroundColor: `${C.accent}25`, borderWidth: 1.5, borderColor: `${C.accent}50`, alignItems: "center", justifyContent: "center" },
    avatarText:      { fontSize: 14, fontWeight: "900", color: C.accent },

    // Active Order
    orderCard:       { marginHorizontal: 16, marginTop: 20, backgroundColor: C.surface, borderRadius: 24, borderWidth: 1, borderColor: C.border, padding: 18 },
    orderHeader:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    orderHeaderText: { fontSize: 12, fontWeight: "700", color: C.foreground },
    orderIdText:     { fontSize: 10, color: C.mutedForeground, fontFamily: "monospace" },
    orderProduct:    { fontSize: 13, color: C.mutedForeground, marginBottom: 16 },
    stepsRow:        { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    stepCol:         { alignItems: "center", flex: 1 },
    stepCircle:      { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 4 },
    stepDone:        { backgroundColor: C.accent },
    stepActive:      { backgroundColor: `${C.accent}25`, borderWidth: 1.5, borderColor: C.accent },
    stepPending:     { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
    stepCircleText:  { fontSize: 9, fontWeight: "900", color: "#fff" },
    stepLabel:       { fontSize: 7, color: C.mutedForeground, textAlign: "center" },
    progressTrack:   { height: 4, backgroundColor: C.surface2, borderRadius: 2, marginBottom: 6, overflow: "hidden" },
    progressFill:    { height: "100%", backgroundColor: C.accent, borderRadius: 2 },
    progressLabel:   { fontSize: 11, fontWeight: "600", color: C.accent, marginBottom: 12 },
    orderBtn:        { backgroundColor: C.surface2, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingVertical: 10, alignItems: "center" },
    orderBtnText:    { fontSize: 12, fontWeight: "600", color: C.foreground },

    // Sections
    section:         { paddingHorizontal: 16, marginTop: 20 },
    sectionRow:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle:    { fontSize: 14, fontWeight: "700", color: C.foreground, marginBottom: 12 },
    sectionMore:     { fontSize: 11, color: C.accent },

    // Quick actions
    actionsRow:      { flexDirection: "row", gap: 10 },
    actionCard:      { flex: 1, borderRadius: 18, borderWidth: 1, padding: 14 },
    actionEmoji:     { fontSize: 22, marginBottom: 6 },
    actionLabel:     { fontSize: 12, fontWeight: "700", marginBottom: 2 },
    actionSub:       { fontSize: 9, color: C.mutedForeground },

    // Recommendations
    recsGrid:        { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    recCard:         { width: (width - 42) / 2, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
    recImg:          { height: 90, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center" },
    recEmoji:        { fontSize: 34 },
    recInfo:         { padding: 10 },
    recTag:          { fontSize: 9, fontWeight: "700", color: C.accent, marginBottom: 2 },
    recName:         { fontSize: 11, color: C.foreground, lineHeight: 15, marginBottom: 4 },
    recPrice:        { fontSize: 13, fontWeight: "700", color: C.accent },

    // Activity
    activityItem:    { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 8 },
    activityIcon:    { fontSize: 20, width: 28, textAlign: "center" },
    activityBody:    { flex: 1 },
    activityText:    { fontSize: 12, fontWeight: "600", color: C.foreground },
    activitySub:     { fontSize: 10, color: C.mutedForeground, marginTop: 1 },
    activityChevron: { fontSize: 18, color: C.subtleForeground },
  });
}
