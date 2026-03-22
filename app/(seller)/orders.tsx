// ─── Satıcı Sipariş Yönetimi — App Lite ──────────────────────────────────────
// Chip bar: Tümü | Yeni | Hazırlanıyor | Kargoda | Tamamlandı
// Hızlı Aksiyon: Onayla / Kargolandı olarak işaretle
// useTheme() — dark/light uyumlu
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
import { useTheme } from "../../hooks/useTheme";
import {
  MOCK_SELLER_ORDERS,
  type SellerOrder,
  type SellerOrderStatus,
  type SellerOrderType,
} from "../../lib/mock-data/partner-orders";

const TL = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });

// ─── Renk & Etiket ───────────────────────────────────────────────────────────
const STATUS_META: Record<SellerOrderStatus, { label: string; color: string; dot: string }> = {
  new:        { label: "Yeni",         color: "#ef4444", dot: "🔴" },
  processing: { label: "Hazırlanıyor", color: "#f97316", dot: "🟠" },
  shipped:    { label: "Kargoda",      color: "#3b82f6", dot: "🔵" },
  completed:  { label: "Tamamlandı",   color: "#22c55e", dot: "🟢" },
  cancelled:  { label: "İptal",        color: "#6b7280", dot: "⚪" },
};

const TYPE_META: Record<SellerOrderType, { label: string; color: string }> = {
  physical: { label: "📦 Fiziksel",   color: "#3b82f6" },
  digital:  { label: "💾 Dijital",    color: "#8b5cf6" },
  fidrop:   { label: "🖨️ Fidrop 3D", color: "#ff6b2b" },
};

const CHIPS: { status: SellerOrderStatus | "all"; label: string; dot: string }[] = [
  { status: "all",        label: "Tümü",        dot: "⚫" },
  { status: "new",        label: "Yeni",        dot: "🔴" },
  { status: "processing", label: "Hazırlanıyor",dot: "🟠" },
  { status: "shipped",    label: "Kargoda",     dot: "🔵" },
  { status: "completed",  label: "Tamamlandı",  dot: "🟢" },
];

const NEXT_ACTION: Partial<Record<SellerOrderStatus, string>> = {
  new:        "Onayla",
  processing: "Kargolandı",
};
const NEXT_STATUS: Partial<Record<SellerOrderStatus, SellerOrderStatus>> = {
  new:        "processing",
  processing: "shipped",
};

// ─── Sipariş Kartı ────────────────────────────────────────────────────────────
function OrderCard({
  order, onAction, colors,
}: {
  order:    SellerOrder;
  onAction: (id: string, next: SellerOrderStatus) => void;
  colors:   ReturnType<typeof useTheme>["colors"];
}) {
  const sm     = STATUS_META[order.status];
  const tm     = TYPE_META[order.type];
  const nextSt = NEXT_STATUS[order.status];
  const nextLb = NEXT_ACTION[order.status];

  return (
    <View style={{
      backgroundColor: colors.surface2,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
      overflow: "hidden",
    }}>
      {/* Üst şerit — durum rengi */}
      <View style={{ height: 3, backgroundColor: sm.color }} />

      <View style={{ padding: 14 }}>
        {/* Başlık satırı */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "900", color: colors.foreground, fontFamily: "monospace" }}>
              {order.orderNo}
            </Text>
            {/* Tip rozeti */}
            <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, backgroundColor: tm.color + "20" }}>
              <Text style={{ fontSize: 9, fontWeight: "800", color: tm.color }}>{tm.label}</Text>
            </View>
          </View>
          {/* Durum rozeti */}
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: sm.color + "18" }}>
            <Text style={{ fontSize: 9, fontWeight: "800", color: sm.color }}>{sm.dot} {sm.label}</Text>
          </View>
        </View>

        {/* Müşteri + ürün */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground, marginBottom: 2 }}>
          {order.customer.name}
        </Text>
        <Text style={{ fontSize: 11, color: colors.mutedForeground, marginBottom: 10 }} numberOfLines={1}>
          {order.items.map(i => `${i.name} ×${i.quantity}`).join(", ")}
        </Text>

        {/* Fidrop adımı */}
        {order.fidropStep && (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            marginBottom: 10, paddingHorizontal: 10, paddingVertical: 6,
            borderRadius: 10, backgroundColor: "#ff6b2b18",
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#ff6b2b" }}>
              🖨️ {order.fidropStep === "print_started" ? "Baskı Başladı" :
                   order.fidropStep === "support_removal" ? "Destekler Temizleniyor" :
                   order.fidropStep === "quality_control" ? "Kalite Kontrol" :
                   order.fidropStep === "packaging" ? "Paketleniyor" : "Teslime Hazır"}
            </Text>
          </View>
        )}

        {/* Alt satır: tutar + aksiyonlar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 15, fontWeight: "900", color: colors.foreground, fontFamily: "monospace" }}>
              {TL(order.totalAmount)}
            </Text>
            <Text style={{ fontSize: 10, color: "#22c55e", fontWeight: "700" }}>+{TL(order.netEarning)} net</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Text style={{ fontSize: 10, color: colors.subtleForeground }}>{fmtDate(order.createdAt)}</Text>
            {nextSt && nextLb && (
              <TouchableOpacity
                onPress={() => onAction(order.id, nextSt)}
                activeOpacity={0.85}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8,
                  borderRadius: 10, backgroundColor: "#ff6b2b",
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "900", color: "#fff" }}>{nextLb} →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function SellerOrdersScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { colors } = useTheme();

  const [orders,    setOrders]    = useState<SellerOrder[]>(MOCK_SELLER_ORDERS);
  const [activeTab, setActiveTab] = useState<SellerOrderStatus | "all">("new");

  const styles = useMemo(() => StyleSheet.create({
    container:   { flex: 1, backgroundColor: colors.background },
    header:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
    backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    backArrow:   { fontSize: 22, color: colors.foreground, lineHeight: 28, marginTop: -2 },
    headerTitle: { fontSize: 16, fontWeight: "900", color: colors.foreground },
    headerSub:   { fontSize: 10, color: colors.mutedForeground, marginTop: 1 },
    chipBarWrap: { borderBottomWidth: 1, borderBottomColor: colors.border },
    list:        { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingTop: 12 },
    emptyBox:    { alignItems: "center", paddingTop: 60, gap: 8 },
  }), [colors]);

  // Tab sayaçları
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    orders.forEach(o => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders]);

  const filtered = useMemo(() =>
    activeTab === "all" ? orders : orders.filter(o => o.status === activeTab),
    [orders, activeTab]
  );

  const handleAction = (id: string, next: SellerOrderStatus) => {
    const order = orders.find(o => o.id === id);
    const label = next === "processing" ? "hazırlanıyor" : "kargoda";
    Alert.alert(
      "İşlemi Onayla",
      `Sipariş ${order?.orderNo} → "${STATUS_META[next].label}" olarak işaretlensin mi?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet",
          onPress: () => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o)),
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Siparişlerim</Text>
          <Text style={styles.headerSub}>
            {counts["new"] ?? 0} yeni · {counts["processing"] ?? 0} hazırlanıyor · {counts["shipped"] ?? 0} kargoda
          </Text>
        </View>
        <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: colors.mutedForeground }}>Web'de tam yönet</Text>
        </View>
      </View>

      {/* Chip Bar */}
      <View style={styles.chipBarWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 }}
        >
        {CHIPS.map(chip => {
          const isActive = activeTab === chip.status;
          const count    = counts[chip.status] ?? 0;
          return (
            <TouchableOpacity
              key={chip.status}
              onPress={() => setActiveTab(chip.status)}
              style={{
                flexDirection: "row", alignItems: "center", gap: 5,
                paddingHorizontal: 12, paddingVertical: 7,
                borderRadius: 99, marginRight: 8,
                backgroundColor: isActive ? "#ff6b2b" : colors.surface2,
                borderWidth: 1,
                borderColor: isActive ? "#ff6b2b" : colors.border,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "800", color: isActive ? "#fff" : colors.mutedForeground }}>
                {chip.dot} {chip.label}
              </Text>
              {count > 0 && (
                <View style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.25)" : colors.surface,
                  borderRadius: 99, paddingHorizontal: 6, paddingVertical: 1,
                }}>
                  <Text style={{ fontSize: 9, fontWeight: "900", color: isActive ? "#fff" : colors.mutedForeground }}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        </ScrollView>
      </View>

      {/* Liste */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length > 0 ? (
          filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onAction={handleAction}
              colors={colors}
            />
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48 }}>📭</Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: colors.foreground }}>Sipariş yok</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Bu sekmede henüz sipariş bulunmuyor</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
