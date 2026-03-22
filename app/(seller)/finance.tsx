// ─── Satıcı Finans Lite — App ─────────────────────────────────────────────────
// Carousel: 3 bakiye kartı yatay kaydırılabilir (pagingEnabled)
// Liste: Son işlemler basit, okunabilir format
// useTheme() — dark/light uyumlu
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { MOCK_PARTNER_FINANCE } from "../../lib/mock-data/partner-finance";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 48; // 24px padding her yanda

const TL = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

const TLDec = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });

const LEDGER_STATUS = {
  paid:    { label: "Ödendi",   color: "#22c55e" },
  pending: { label: "Bekliyor", color: "#eab308" },
  blocked: { label: "Bloke",    color: "#ef4444" },
};

// ─── Bakiye Kartları verisi ───────────────────────────────────────────────────
const balanceCards = (balance: typeof MOCK_PARTNER_FINANCE["balance"]) => [
  {
    title:  "Çekilebilir Bakiye",
    emoji:  "💚",
    amount: balance.withdrawable,
    sub:    "Hesabına aktarılabilir",
    accent: "#22c55e",
    bg:     "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
  },
  {
    title:  "Bekleyen / Bloke",
    emoji:  "🟡",
    amount: balance.pending,
    sub:    "İyzico güvencesinde",
    accent: "#eab308",
    bg:     "rgba(234,179,8,0.08)",
    border: "rgba(234,179,8,0.2)",
  },
  {
    title:  "Toplam Ciro (Bu Ay)",
    emoji:  "💙",
    amount: balance.totalRevenue,
    sub:    "Komisyon öncesi brüt",
    accent: "#3b82f6",
    bg:     "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)",
  },
];

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function SellerFinanceScreen() {
  const router     = useRouter();
  const insets     = useSafeAreaInsets();
  const { colors } = useTheme();

  const { balance, ledger, payoutSchedule } = MOCK_PARTNER_FINANCE;
  const cards    = balanceCards(balance);
  const [cardIdx, setCardIdx] = useState(0);

  const styles = useMemo(() => StyleSheet.create({
    container:   { flex: 1, backgroundColor: colors.background },
    header:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
    backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    backArrow:   { fontSize: 22, color: colors.foreground, lineHeight: 28, marginTop: -2 },
    headerTitle: { fontSize: 16, fontWeight: "900", color: colors.foreground },
    headerSub:   { fontSize: 10, color: colors.mutedForeground, marginTop: 1 },
    scroll:      { flex: 1 },
  }), [colors]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
    setCardIdx(idx);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Finans & Ödeme</Text>
          <Text style={styles.headerSub}>Kazanç özeti ve işlem dökümü</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>

        {/* ── Carousel Bakiye Kartları ── */}
        <View style={{ marginTop: 16 }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_W + 16}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            onMomentumScrollEnd={onScrollEnd}
          >
            {cards.map((card, i) => (
              <View key={i} style={{
                width: CARD_W,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: card.border,
                backgroundColor: card.bg,
                padding: 20,
              }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: card.accent, marginBottom: 12 }}>
                  {card.emoji}  {card.title}
                </Text>
                <Text style={{ fontSize: 32, fontWeight: "900", color: card.accent, fontFamily: "monospace", letterSpacing: -1 }}>
                  {TL(card.amount)}
                </Text>
                <Text style={{ fontSize: 11, color: card.accent + "99", marginTop: 6 }}>{card.sub}</Text>

                {/* Sonraki ödeme sadece "bekleyen" kartında */}
                {i === 1 && payoutSchedule[0] && (
                  <View style={{
                    marginTop: 14, paddingHorizontal: 12, paddingVertical: 8,
                    borderRadius: 12, backgroundColor: "rgba(234,179,8,0.12)",
                    borderWidth: 1, borderColor: "rgba(234,179,8,0.2)",
                  }}>
                    <Text style={{ fontSize: 10, color: "#eab308", fontWeight: "700" }}>
                      📅 Sonraki: {payoutSchedule[0].dayLabel} · {TL(payoutSchedule[0].amount)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Nokta indikatörleri */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 12 }}>
            {cards.map((_, i) => (
              <View key={i} style={{
                width: i === cardIdx ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === cardIdx ? "#ff6b2b" : colors.border,
              }} />
            ))}
          </View>
        </View>

        {/* ── Yaklaşan Ödeme ── */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
            Yaklaşan Ödemeler
          </Text>
          {payoutSchedule.map(p => (
            <View key={p.id} style={{
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              backgroundColor: colors.surface2, borderRadius: 14, borderWidth: 1,
              borderColor: colors.border, padding: 14, marginBottom: 8,
            }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "800", color: colors.foreground }}>
                  {p.dayLabel}
                </Text>
                <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 2 }}>
                  {p.orderCount} sipariş · İyzico transferi
                </Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#22c55e", fontFamily: "monospace" }}>
                {TL(p.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Son İşlemler ── */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
            Son İşlemler
          </Text>
          <View style={{ backgroundColor: colors.surface2, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
            {ledger.map((entry, i) => {
              const st = LEDGER_STATUS[entry.status];
              return (
                <View key={entry.id} style={{
                  flexDirection: "row", alignItems: "center",
                  paddingHorizontal: 14, paddingVertical: 12,
                  borderBottomWidth: i < ledger.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}>
                  {/* Durum şeridi */}
                  <View style={{ width: 3, height: 36, borderRadius: 2, backgroundColor: st.color, marginRight: 12 }} />

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 11, fontWeight: "800", color: colors.foreground, fontFamily: "monospace" }}>
                      {entry.orderNo}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 1 }} numberOfLines={1}>
                      {entry.customer} · {entry.product}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: "900", color: "#22c55e", fontFamily: "monospace" }}>
                      {TLDec(entry.netEarning)}
                    </Text>
                    <View style={{ marginTop: 3, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99, backgroundColor: st.color + "20" }}>
                      <Text style={{ fontSize: 8, fontWeight: "800", color: st.color }}>{st.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={{ fontSize: 10, color: colors.subtleForeground, textAlign: "center", marginTop: 10 }}>
            Detaylı döküm için Web panelini kullan
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}
