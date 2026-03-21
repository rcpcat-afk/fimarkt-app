// ─── Tekliflerim — RFQ Liste Ekranı ──────────────────────────────────────────
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants";

// ── Tipler ────────────────────────────────────────────────────────────────────
type TeklifStatus = "pending" | "offer_received" | "in_progress" | "completed" | "cancelled";

interface Teklif {
  id:          string;
  title:       string;
  category:    string;
  status:      TeklifStatus;
  engineer:    { name: string; initials: string } | null;
  budget:      string;
  date:        string;
  lastMessage: string;
}

// ── Mock veri ─────────────────────────────────────────────────────────────────
const MOCK_TEKLIFLER: Teklif[] = [
  {
    id:          "rfq-2024-001",
    title:       "Kırık Dişli Mili — Yedek Parça",
    category:    "Mühendislik Parçası",
    status:      "offer_received",
    engineer:    { name: "Ali Yılmaz", initials: "AY" },
    budget:      "500₺",
    date:        "12 Mar 2026",
    lastMessage: "500₺'ye teklif verdim, ne düşünürsünüz?",
  },
  {
    id:          "rfq-2024-002",
    title:       "Firma Logosu 3D Plaket",
    category:    "Kurumsal Tasarım",
    status:      "pending",
    engineer:    null,
    budget:      "300–600₺",
    date:        "18 Mar 2026",
    lastMessage: "Uzman araması yapılıyor...",
  },
  {
    id:          "rfq-2024-003",
    title:       "Özel Bisiklet Gidon Tutacağı",
    category:    "Spor & Outdoor",
    status:      "in_progress",
    engineer:    { name: "Selin Kara", initials: "SK" },
    budget:      "850₺",
    date:        "5 Mar 2026",
    lastMessage: "Tasarım dosyaları hazırlanıyor, %60 tamamlandı.",
  },
  {
    id:          "rfq-2024-004",
    title:       "Vintage Heykel Replikası",
    category:    "Sanat & Hobi",
    status:      "completed",
    engineer:    { name: "Mert Karakoç", initials: "MK" },
    budget:      "1.200₺",
    date:        "20 Şub 2026",
    lastMessage: "Dosyalar teslim edildi. Proje tamamlandı! 🎉",
  },
];

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<TeklifStatus, { label: string; icon: string; color: string }> = {
  pending:        { label: "Uzman Aranıyor",       icon: "⏳", color: "#f59e0b" },
  offer_received: { label: "Teklif Alındı",        icon: "💬", color: Colors.accent  },
  in_progress:    { label: "Devam Ediyor",          icon: "🔧", color: "#3b82f6" },
  completed:      { label: "Tamamlandı",            icon: "✅", color: "#22c55e" },
  cancelled:      { label: "İptal Edildi",          icon: "❌", color: "#ef4444" },
};

// ── Tab config ─────────────────────────────────────────────────────────────────
const TAB_FILTERS: { key: string; label: string }[] = [
  { key: "all",            label: "Tümü"          },
  { key: "offer_received", label: "Teklif Alındı" },
  { key: "in_progress",    label: "Devam Ediyor"  },
  { key: "completed",      label: "Tamamlandı"    },
];

// ── Teklif kartı ──────────────────────────────────────────────────────────────
function TeklifCard({ t, onPress }: { t: Teklif; onPress: () => void }) {
  const s = STATUS_CONFIG[t.status];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Renk şeridi */}
      <View style={[styles.cardStripe, { backgroundColor: s.color }]} />

      <View style={styles.cardBody}>
        {/* Üst satır */}
        <View style={styles.cardTop}>
          <View style={styles.cardIconWrap}>
            <Text style={{ fontSize: 18 }}>📋</Text>
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={[styles.cardCategory, { color: s.color }]}>{t.category}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>{t.title}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: s.color + "18" }]}>
            <Text style={[styles.badgeText, { color: s.color }]}>{s.icon} {s.label}</Text>
          </View>
        </View>

        {/* Son mesaj */}
        <Text style={styles.lastMsg} numberOfLines={1}>{t.lastMessage}</Text>

        <View style={styles.divider} />

        {/* Alt satır */}
        <View style={styles.cardBottom}>
          <View style={styles.cardBottomLeft}>
            {t.engineer ? (
              <View style={styles.engineerRow}>
                <View style={styles.engineerAvatar}>
                  <Text style={styles.engineerInitials}>{t.engineer.initials}</Text>
                </View>
                <Text style={styles.engineerName}>{t.engineer.name}</Text>
              </View>
            ) : (
              <Text style={styles.engineerWaiting}>Uzman bekleniyor</Text>
            )}
            <Text style={styles.dot}>·</Text>
            <Text style={styles.date}>{t.date}</Text>
          </View>
          <View style={styles.cardBottomRight}>
            <Text style={styles.budget}>{t.budget}</Text>
            <View style={styles.chatBtn}>
              <Text style={styles.chatBtnText}>Sohbet →</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Ekran ─────────────────────────────────────────────────────────────────────
export default function TekliflerimScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all"
    ? MOCK_TEKLIFLER
    : MOCK_TEKLIFLER.filter(t => t.status === activeTab);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Tekliflerim</Text>
          <Text style={styles.subtitle}>{MOCK_TEKLIFLER.length} aktif talep</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push("/(print)/tasarim-iste" as never)}
        >
          <Text style={styles.newBtnText}>＋ Yeni</Text>
        </TouchableOpacity>
      </View>

      {/* Tab filtreler */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {TAB_FILTERS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>Teklif Bulunamadı</Text>
            <Text style={styles.emptySub}>Bu kategoride teklif talebiniz yok</Text>
          </View>
        ) : (
          filtered.map(t => (
            <TeklifCard
              key={t.id}
              t={t}
              onPress={() => router.push(`/(account)/teklif/${t.id}` as never)}
            />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.bg },
  header:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn:        { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  backArrow:      { fontSize: 28, color: Colors.text, lineHeight: 32, marginTop: -2 },
  headerCenter:   { flex: 1 },
  title:          { fontSize: 18, fontWeight: "800", color: Colors.text },
  subtitle:       { fontSize: 11, color: Colors.text2, marginTop: 1 },
  newBtn:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: Colors.accent + "18", borderWidth: 1, borderColor: Colors.accent + "30" },
  newBtnText:     { fontSize: 12, fontWeight: "700", color: Colors.accent },

  tabs:           { paddingHorizontal: 16, paddingBottom: 12, gap: 8, alignItems: "center" },
  tab:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, backgroundColor: Colors.surface2 },
  tabActive:      { backgroundColor: Colors.accent },
  tabText:        { fontSize: 12, fontWeight: "700", color: Colors.text2 },
  tabTextActive:  { color: "#fff" },

  list:           { paddingHorizontal: 16, paddingTop: 4 },

  card:           { backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, marginBottom: 12, overflow: "hidden" },
  cardStripe:     { height: 2 },
  cardBody:       { padding: 14 },
  cardTop:        { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  cardIconWrap:   { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.accent + "15", borderWidth: 1, borderColor: Colors.accent + "25", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitleWrap:  { flex: 1 },
  cardCategory:   { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  cardTitle:      { fontSize: 13, fontWeight: "800", color: Colors.text },
  badge:          { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 99, flexShrink: 0 },
  badgeText:      { fontSize: 9, fontWeight: "800" },
  lastMsg:        { fontSize: 11, color: Colors.text2, marginBottom: 10 },
  divider:        { height: 1, backgroundColor: Colors.border, marginBottom: 10 },
  cardBottom:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardBottomLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  engineerRow:    { flexDirection: "row", alignItems: "center", gap: 5 },
  engineerAvatar: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  engineerInitials:{ fontSize: 8, fontWeight: "800", color: "#fff" },
  engineerName:   { fontSize: 11, color: Colors.text2 },
  engineerWaiting:{ fontSize: 11, color: Colors.text3, fontStyle: "italic" },
  dot:            { fontSize: 10, color: Colors.text3 },
  date:           { fontSize: 10, color: Colors.text3 },
  cardBottomRight:{ flexDirection: "row", alignItems: "center", gap: 8 },
  budget:         { fontSize: 12, fontWeight: "800", color: Colors.text },
  chatBtn:        { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: Colors.accent + "15" },
  chatBtnText:    { fontSize: 11, fontWeight: "700", color: Colors.accent },

  empty:          { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyEmoji:     { fontSize: 56, marginBottom: 8 },
  emptyTitle:     { fontSize: 18, fontWeight: "800", color: Colors.text },
  emptySub:       { fontSize: 13, color: Colors.text2, textAlign: "center" },
});
