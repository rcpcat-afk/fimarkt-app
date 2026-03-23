// ─── Tekliflerim — RFQ Inbox (App) ───────────────────────────────────────────
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type ThemeColors } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import { MOCK_TEKLIFLER, type Teklif, type TeklifStatus } from "../../lib/mock-data/rfq-list";

// ─── Theme helpers ────────────────────────────────────────────────────────────
function buildC(colors: ThemeColors) {
  return {
    ...colors,
    bg:    colors.background,
    text:  colors.foreground,
    text2: colors.mutedForeground,
    text3: colors.subtleForeground,
  };
}
type AliasedColors = ReturnType<typeof buildC>;

function createStyles(C: AliasedColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },

    // ── Header ──
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    },
    backBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: C.surface2,
      borderWidth: 1, borderColor: C.border,
      alignItems: "center", justifyContent: "center",
    },
    backArrow:      { fontSize: 28, color: C.text, lineHeight: 32, marginTop: -2 },
    headerCenter:   { flex: 1 },
    headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    title:          { fontSize: 18, fontWeight: "800", color: C.text },
    subtitle:       { fontSize: 11, color: C.text2, marginTop: 1 },
    headerNotifBadge: {
      minWidth: 20, height: 20, borderRadius: 10, backgroundColor: "#ef4444",
      alignItems: "center", justifyContent: "center", paddingHorizontal: 5,
    },
    headerNotifText: { fontSize: 10, fontWeight: "900", color: "#fff" },
    newBtn: {
      paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
      backgroundColor: `${C.accent}18`,
      borderWidth: 1, borderColor: `${C.accent}30`,
    },
    newBtnText: { fontSize: 12, fontWeight: "700", color: C.accent },

    // ── Tabs ──
    // tabsWrapper: View wrapper içerik kadar büyür, flex almaz
    tabsWrapper:  { },
    tabsContent:  { paddingHorizontal: 16, paddingVertical: 8 },
    tab: {
      flexDirection: "row", alignItems: "center", gap: 5,
      paddingHorizontal: 12, paddingVertical: 7,
      borderRadius: 99,
      backgroundColor: C.surface2,
      borderWidth: 1, borderColor: C.border,
      marginRight: 8,
    },
    tabActive:          { backgroundColor: C.accent, borderColor: C.accent },
    tabText:            { fontSize: 12, fontWeight: "700", color: C.text2 },
    tabTextActive:      { color: "#fff" },
    tabCount: {
      minWidth: 16, height: 16, borderRadius: 8,
      backgroundColor: C.surface,
      alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
    },
    tabCountActive:     { backgroundColor: "rgba(255,255,255,0.25)" },
    tabCountText:       { fontSize: 9, fontWeight: "900", color: C.text3 },
    tabCountTextActive: { color: "#fff" },

    // ── List ──
    list:        { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },

    // ── Card ──
    card: {
      backgroundColor: C.surface2,
      borderWidth: 1, borderColor: C.border,
      borderRadius: 16, marginBottom: 12, overflow: "hidden",
    },
    cardStripe: { height: 2 },
    cardBody:   { padding: 14 },
    cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
    cardIconWrap: {
      width: 38, height: 38, borderRadius: 10, borderWidth: 1,
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    cardTitleWrap: { flex: 1 },
    cardCategory: {
      fontSize: 9, fontWeight: "700",
      textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2,
    },
    cardTitle:   { fontSize: 13, fontWeight: "800", color: C.text },
    cardRight:   { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 0 },
    badge:       { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 99 },
    badgeText:   { fontSize: 9, fontWeight: "800" },
    notifDot: {
      position: "absolute", top: -6, right: -6,
      minWidth: 18, height: 18, borderRadius: 9,
      backgroundColor: "#ef4444",
      alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
      borderWidth: 1.5, borderColor: C.bg,
    },
    notifDotText: { fontSize: 9, fontWeight: "900", color: "#fff" },
    menuBtn: {
      width: 28, height: 28, borderRadius: 8, backgroundColor: C.surface,
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: C.border,
    },
    menuBtnText: { fontSize: 16, color: C.text2, lineHeight: 20 },
    lastMsg: { fontSize: 11, color: C.text2, marginBottom: 10 },
    divider: { height: 1, backgroundColor: C.border, marginBottom: 10 },
    cardBottom:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    cardBottomLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
    engineerRow:    { flexDirection: "row", alignItems: "center", gap: 5 },
    engineerAvatar: {
      width: 20, height: 20, borderRadius: 10, backgroundColor: C.accent,
      alignItems: "center", justifyContent: "center",
    },
    engineerInitials: { fontSize: 8, fontWeight: "800", color: "#fff" },
    engineerName:     { fontSize: 11, color: C.text2, maxWidth: 90 },
    engineerWaiting:  { fontSize: 11, color: C.text3, fontStyle: "italic" },
    dot:              { fontSize: 10, color: C.text3 },
    date:             { fontSize: 10, color: C.text3 },
    cardBottomRight:  { flexDirection: "row", alignItems: "center", gap: 8 },
    budget:           { fontSize: 12, fontWeight: "800", color: C.text },
    chatBtn:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    chatBtnText:      { fontSize: 11, fontWeight: "700" },
    offerCta: {
      marginTop: 12, backgroundColor: C.accent,
      paddingVertical: 13, borderRadius: 12,
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    },
    offerCtaText:      { fontSize: 14, fontWeight: "800", color: "#fff" },
    offerCtaBadge:     { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
    offerCtaBadgeText: { fontSize: 10, fontWeight: "900", color: "#fff" },
    empty:      { alignItems: "center", paddingTop: 60, gap: 8 },
    emptyEmoji: { fontSize: 56, marginBottom: 8 },
    emptyTitle: { fontSize: 18, fontWeight: "800", color: C.text },
    emptySub:   { fontSize: 13, color: C.text2, textAlign: "center" },
  });
}

// ─── Status Config ─────────────────────────────────────────────────────────────
function getStatusConfig(C: AliasedColors): Record<TeklifStatus, { label: string; icon: string; color: string }> {
  return {
    pending:        { label: "Uzman Aranıyor",   icon: "⏳", color: "#f59e0b"  },
    offer_received: { label: "Yeni Teklif Var!", icon: "💬", color: C.accent   },
    in_progress:    { label: "Devam Ediyor",     icon: "🔧", color: "#3b82f6"  },
    completed:      { label: "Tamamlandı",       icon: "✅", color: "#22c55e"  },
    cancelled:      { label: "İptal Edildi",     icon: "❌", color: "#ef4444"  },
  };
}

const TABS: { key: string; label: string }[] = [
  { key: "all",            label: "Tümü"          },
  { key: "offer_received", label: "Teklif Alındı" },
  { key: "pending",        label: "Uzman Aranıyor" },
  { key: "in_progress",    label: "Devam Ediyor"  },
  { key: "completed",      label: "Tamamlandı"    },
];

// ─── Teklif Kartı ──────────────────────────────────────────────────────────────
function TeklifCard({ t, onPress, onCancel }: {
  t: Teklif;
  onPress: () => void;
  onCancel: (id: string) => void;
}) {
  const { colors, isDark } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

  const STATUS_CONFIG = useMemo(() => getStatusConfig(C), [C]);
  const s               = STATUS_CONFIG[t.status];
  const isOfferReceived = t.status === "offer_received";
  const isPending       = t.status === "pending";

  const handleMenuPress = () => {
    Alert.alert(t.title, "Bu teklif talebi için ne yapmak istiyorsunuz?", [
      {
        text: "❌ İptal Et / Sil",
        style: "destructive",
        onPress: () =>
          Alert.alert("Emin misiniz?", "Bu talebi iptal etmek geri alınamaz.", [
            { text: "Vazgeç", style: "cancel" },
            { text: "İptal Et", style: "destructive", onPress: () => onCancel(t.id) },
          ]),
      },
      { text: "Vazgeç", style: "cancel" },
    ]);
  };

  const glowStyle = isOfferReceived ? {
    shadowColor: C.accent, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55, shadowRadius: 12, elevation: 14,
    borderColor: `${C.accent}88`, borderWidth: 1.5,
  } : {};

  return (
    <View style={[styles.card, glowStyle]}>
      <View style={[styles.cardStripe, { backgroundColor: s.color }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={[styles.cardIconWrap, { backgroundColor: `${s.color}18`, borderColor: `${s.color}28` }]}>
            <Text style={{ fontSize: 18 }}>📋</Text>
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={[styles.cardCategory, { color: s.color }]}>{t.category}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>{t.title}</Text>
          </View>
          <View style={styles.cardRight}>
            <View>
              <View style={[styles.badge, { backgroundColor: `${s.color}18` }]}>
                <Text style={[styles.badgeText, { color: s.color }]}>{s.icon} {s.label}</Text>
              </View>
              {isOfferReceived && t.unreadCount > 0 && (
                <View style={styles.notifDot}>
                  <Text style={styles.notifDotText}>{t.unreadCount}</Text>
                </View>
              )}
            </View>
            {isPending && (
              <TouchableOpacity style={styles.menuBtn} onPress={handleMenuPress}>
                <Text style={styles.menuBtnText}>⋮</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.lastMsg} numberOfLines={1}>{t.lastMessage}</Text>
        <View style={styles.divider} />

        <View style={styles.cardBottom}>
          <View style={styles.cardBottomLeft}>
            {t.engineer ? (
              <View style={styles.engineerRow}>
                <View style={styles.engineerAvatar}>
                  <Text style={styles.engineerInitials}>{t.engineer.initials}</Text>
                </View>
                <Text style={styles.engineerName} numberOfLines={1}>{t.engineer.name}</Text>
              </View>
            ) : (
              <Text style={styles.engineerWaiting}>Uzman bekleniyor</Text>
            )}
            <Text style={styles.dot}>·</Text>
            <Text style={styles.date}>{t.date}</Text>
          </View>
          <View style={styles.cardBottomRight}>
            <Text style={styles.budget}>{t.budget}</Text>
            {!isOfferReceived && t.status !== "cancelled" && (
              <TouchableOpacity style={[styles.chatBtn, { backgroundColor: `${s.color}18` }]} onPress={onPress}>
                <Text style={[styles.chatBtnText, { color: s.color }]}>Sohbet →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isOfferReceived && (
          <TouchableOpacity style={styles.offerCta} onPress={onPress} activeOpacity={0.85}>
            <Text style={styles.offerCtaText}>💬 Teklifleri İncele</Text>
            {t.unreadCount > 0 && (
              <View style={styles.offerCtaBadge}>
                <Text style={styles.offerCtaBadgeText}>{t.unreadCount} yeni</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function TekliflerimScreen() {
  const { colors, isDark } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("all");
  const [teklifler, setTeklifler] = useState<Teklif[]>(MOCK_TEKLIFLER);

  const filtered = activeTab === "all"
    ? teklifler
    : teklifler.filter(t => t.status === activeTab);

  const handleCancel = (id: string) => {
    setTeklifler(prev =>
      prev.map(t => t.id === id ? { ...t, status: "cancelled" as TeklifStatus } : t),
    );
  };

  const newOfferCount = teklifler.filter(
    t => t.status === "offer_received" && t.unreadCount > 0,
  ).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.title}>Tekliflerim</Text>
            {newOfferCount > 0 && (
              <View style={styles.headerNotifBadge}>
                <Text style={styles.headerNotifText}>{newOfferCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>{teklifler.length} aktif talep</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push("/(print)/tasarim-iste" as never)}
        >
          <Text style={styles.newBtnText}>＋ Yeni</Text>
        </TouchableOpacity>
      </View>

      {/* ── Tab Bar ──
          Ayrı bir horizontal ScrollView, kesin sabit yükseklik yok.
          İçeriğiyle birlikte doğal boyutlanır. */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            const count = tab.key === "all"
              ? teklifler.length
              : teklifler.filter(t => t.status === tab.key).length;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.tabCount, isActive && styles.tabCountActive]}>
                  <Text style={[styles.tabCountText, isActive && styles.tabCountTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Kart Listesi ──
          Tek bir dikey ScrollView — FlatList yerine.
          flex:1 ile kalan tüm alanı alır. */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>Teklif Bulunamadı</Text>
            <Text style={styles.emptySub}>Bu kategoride teklif talebiniz yok</Text>
          </View>
        ) : (
          filtered.map(item => (
            <TeklifCard
              key={item.id}
              t={item}
              onPress={() => router.push(`/(account)/teklif/${item.id}` as never)}
              onCancel={handleCancel}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
