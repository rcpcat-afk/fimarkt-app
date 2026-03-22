// ─── Satıcı Komuta Merkezi — Lite App Dashboard ───────────────────────────────
// Native kart tabanlı, ScrollView içinde.
// Web dashboardunun mobil simetrisi: aynı metrikler, native UI dili.
// react-native-chart-kit ile haftalık ciro line chart.
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { MOCK_SELLER_DASHBOARD } from "../../lib/mock-data/partner-dashboard";
import type { PartnerOrder, OrderStatus } from "../../lib/types/partner";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TL = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency", currency: "TRY", maximumFractionDigits: 0,
  }).format(n);

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending:    { label: "Bekliyor",      color: "#f59e0b" },
  processing: { label: "Hazırlanıyor",  color: "#3b82f6" },
  shipped:    { label: "Kargoda",       color: "#8b5cf6" },
  delivered:  { label: "Teslim",        color: "#22c55e" },
  cancelled:  { label: "İptal",         color: "#ef4444" },
};

const data = MOCK_SELLER_DASHBOARD;

// ─── Stat Kart ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, urgent }: {
  icon:    string;
  label:   string;
  value:   string | number;
  sub?:    string;
  color:   string;
  urgent?: boolean;
}) {
  return (
    <View style={{
      flex: 1,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor:     `${color}40`,
      backgroundColor: `${color}0d`,
      gap: 10,
    }}>
      <View style={{
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: `${color}20`,
        alignItems: "center", justifyContent: "center",
      }}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View>
        <Text style={{
          fontSize: 22, fontWeight: "900", color,
          fontVariant: ["tabular-nums"],
        }}>
          {value}
          {urgent && <Text style={{ fontSize: 10 }}>●</Text>}
        </Text>
        <Text style={{ fontSize: 10, fontWeight: "700", color: "#8888b0", marginTop: 2 }}>
          {label}
        </Text>
        {sub && (
          <Text style={{ fontSize: 9, color: "#5a5a7a", marginTop: 2 }}>{sub}</Text>
        )}
      </View>
    </View>
  );
}

// ─── Sipariş Satırı ──────────────────────────────────────────────────────────
function OrderRow({ order }: { order: PartnerOrder }) {
  const cfg = STATUS_CONFIG[order.status];
  return (
    <View style={{
      flexDirection: "row", alignItems: "center",
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#2a2a4240",
    }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 10, fontWeight: "800", color: "#ff6b2b", fontFamily: "monospace" }}>
          {order.id}
        </Text>
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#e8e8f5" }} numberOfLines={1}>
          {order.product}
        </Text>
        <Text style={{ fontSize: 10, color: "#8888b0" }}>{order.customer} · {order.date}</Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 4, marginLeft: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: "900", color: "#e8e8f5", fontFamily: "monospace" }}>
          {TL(order.amount)}
        </Text>
        <View style={{
          paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
          backgroundColor: `${cfg.color}20`,
        }}>
          <Text style={{ fontSize: 9, fontWeight: "800", color: cfg.color }}>{cfg.label}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function SellerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container:  { flex: 1, backgroundColor: colors.background },
    header:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerLeft: { gap: 2 },
    headerTag:  { fontSize: 9, fontWeight: "800", color: "#ff6b2b", textTransform: "uppercase", letterSpacing: 1 },
    headerTitle:{ fontSize: 16, fontWeight: "900", color: colors.foreground },
    listContent:{ paddingHorizontal: 16, paddingBottom: 40 },
    section:    { marginTop: 20 },
    sectionTitle: { fontSize: 11, fontWeight: "800", color: colors.subtleForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
    card:       { backgroundColor: colors.surface2, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16 },
    statRow:    { flexDirection: "row", gap: 10 },
    divider:    { height: 1, backgroundColor: colors.border, marginVertical: 4 },
    chip:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    chipText:   { fontSize: 11, fontWeight: "700", color: colors.mutedForeground },
    chipActive: { backgroundColor: "#ff6b2b", borderColor: "#ff6b2b" },
    chipActiveText: { color: "#fff" },
    bottomBar:  { flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
    bottomBtn:  { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12, gap: 3 },
    bottomIcon: { fontSize: 20 },
    bottomLabel:{ fontSize: 9, fontWeight: "700", color: colors.mutedForeground },
  }), [colors]);

  const chartData = {
    labels:   data.weeklyRevenue.map(d => d.day),
    datasets: [{
      data:        data.weeklyRevenue.map(d => d.revenue),
      color:       (opacity = 1) => `rgba(255, 107, 43, ${opacity})`,
      strokeWidth: 2.5,
    }],
  };

  const chartConfig = {
    backgroundColor:          "transparent",
    backgroundGradientFrom:   colors.surface2,
    backgroundGradientTo:     colors.surface2,
    decimalPlaces:            0,
    color:                    (opacity = 1) => `rgba(255, 107, 43, ${opacity})`,
    labelColor:               (opacity = 1) => `rgba(136, 136, 176, ${opacity})`,
    propsForDots:             { r: "4", strokeWidth: "2", stroke: "#ff6b2b" },
    propsForBackgroundLines:  { strokeDasharray: "4 4", stroke: colors.border },
  };

  const bottomNavItems = [
    { icon: "⚡", label: "Dashboard", active: true  },
    { icon: "📦", label: "Siparişler", active: false },
    { icon: "💰", label: "Finans",    active: false },
    { icon: "💬", label: "Mesajlar",  active: false },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTag}>Çözüm Ortağı Paneli</Text>
          <Text style={styles.headerTitle}>{data.storeName}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={{ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.mutedForeground }}>👤 Müşteri</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>

        {/* ── Finansal Özet ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finansal Özet</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={[styles.card, { flex: 1, alignItems: "center" }]}>
              <Text style={{ fontSize: 9, fontWeight: "800", color: colors.subtleForeground, textTransform: "uppercase", letterSpacing: 1 }}>Aylık Ciro</Text>
              <Text style={{ fontSize: 18, fontWeight: "900", color: colors.foreground, marginTop: 4, fontFamily: "monospace" }}>
                {TL(data.totalRevenueMTD)}
              </Text>
            </View>
            <View style={[styles.card, { flex: 1, alignItems: "center" }]}>
              <Text style={{ fontSize: 9, fontWeight: "800", color: colors.subtleForeground, textTransform: "uppercase", letterSpacing: 1 }}>Bekleyen Ödeme</Text>
              <Text style={{ fontSize: 18, fontWeight: "900", color: "#22c55e", marginTop: 4, fontFamily: "monospace" }}>
                {TL(data.pendingPayout)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 4'lü Bento Stats ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bugün</Text>
          <View style={[styles.statRow, { marginBottom: 10 }]}>
            <StatCard icon="📦" label="Kargolanacak" value={data.pendingShipments} sub="bekleyen" color="#f59e0b" urgent={data.pendingShipments > 3} />
            <StatCard icon="⚙️" label="Üretimdeki" value={data.inProduction} sub="aktif iş" color="#3b82f6" />
          </View>
          <View style={styles.statRow}>
            <StatCard icon="💬" label="Cevapsız" value={data.unreadMessages} sub="mesaj" color="#ef4444" urgent={data.unreadMessages > 0} />
            <StatCard icon="💰" label="Günlük Hakediş" value={TL(data.todayEarnings)} color="#22c55e" />
          </View>
        </View>

        {/* ── Ciro Grafiği ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son 7 Gün — Ciro Trendi</Text>
          <View style={[styles.card, { paddingHorizontal: 0, paddingVertical: 16 }]}>
            <LineChart
              data={chartData}
              width={SCREEN_WIDTH - 32}
              height={160}
              chartConfig={chartConfig}
              bezier
              withInnerLines={true}
              withOuterLines={false}
              style={{ borderRadius: 18 }}
              yAxisSuffix="₺"
              formatYLabel={v => `${(Number(v) / 1000).toFixed(0)}K`}
            />
          </View>
        </View>

        {/* ── Son Siparişler ── */}
        <View style={styles.section}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>Son Siparişler</Text>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#ff6b2b" }}>Tümü →</Text>
          </View>
          <View style={styles.card}>
            {data.recentOrders.map(order => (
              <OrderRow key={order.id} order={order} />
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Alt Navigasyon */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
        {bottomNavItems.map(item => (
          <TouchableOpacity key={item.label} style={styles.bottomBtn} activeOpacity={0.7}>
            <Text style={styles.bottomIcon}>{item.icon}</Text>
            <Text style={[styles.bottomLabel, item.active && { color: "#ff6b2b" }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
