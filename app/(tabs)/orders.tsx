// ─── Siparişlerim Tab — Smart Tabs + Premium Order Card ──────────────────────
// Smart Tabs: TÜR bazlı filtre (Pazaryeri / Özel Üretim / Dijital)
// Gerçek WC API entegrasyonu korunur + tip tespiti meta_data'dan yapılır
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
import { getMyOrders, WCOrder } from "../../src/services/api";
import { useAuth } from "../../src/store/AuthContext";
import { useTabBarHeight } from "../../hooks/useTabBarHeight";
import {
  getOrderType,
  type OrderType,
} from "../../lib/mock-data/orders";

// ─── Durum Konfigürasyonu (sabit durum renkleri — tema bağımsız) ─────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  processing:         { label: "Hazırlanıyor",     color: "#f59e0b", icon: "⏳" },
  "on-hold":          { label: "Beklemede",         color: "#f59e0b", icon: "⏸️" },
  pending:            { label: "Ödeme Bekleniyor",  color: "#f59e0b", icon: "💳" },
  shipped:            { label: "Kargoda",           color: "#3b82f6", icon: "🚚" },
  "hezarfen-shipped": { label: "Kargoda",           color: "#3b82f6", icon: "🚚" },
  completed:          { label: "Teslim Edildi",     color: "#22c55e", icon: "✅" },
  cancelled:          { label: "İptal Edildi",      color: "#ef4444", icon: "❌" },
  refunded:           { label: "İade Edildi",       color: "#ef4444", icon: "↩️" },
};

const DEFAULT_STATUS = { label: "Bilinmiyor", color: "#8888b0", icon: "❓" };

// ─── Tip Etiketi ──────────────────────────────────────────────────────────────
type TabKey = "all" | OrderType;

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "all",      label: "Tümü",         icon: "📋" },
  { key: "physical", label: "Pazaryeri",    icon: "🏪" },
  { key: "3d_print", label: "Özel Üretim", icon: "⚙️" },
  { key: "digital",  label: "Dijital",      icon: "📂" },
];

const TYPE_TAGS: Record<string, { label: string; icon: string }> = {
  physical:  { label: "Pazaryeri",   icon: "🏪" },
  "3d_print": { label: "Özel Üretim", icon: "⚙️" },
  digital:   { label: "Dijital",     icon: "📂" },
};

// ─── Style factory ────────────────────────────────────────────────────────────
function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    container:  { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    title:    { fontSize: 22, fontWeight: "800", color: C.foreground, letterSpacing: -0.5 },
    subtitle: { fontSize: 12, color: C.mutedForeground, marginTop: 2 },
    refreshBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: C.surface2,
      borderWidth: 1, borderColor: C.border,
      alignItems: "center", justifyContent: "center",
    },
    refreshIcon: { fontSize: 18, color: C.mutedForeground },

    tabScroll:        { flexGrow: 0, flexShrink: 0, marginBottom: 12 },
    tabScrollContent: { paddingHorizontal: 16, gap: 8 },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 99,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surface2,
    },
    tabActive:     { backgroundColor: C.accent, borderColor: C.accent },
    tabIcon:       { fontSize: 13 },
    tabText:       { fontSize: 12, fontWeight: "600", color: C.mutedForeground },
    tabTextActive: { color: "#fff", fontWeight: "700" },

    list: { paddingHorizontal: 16, paddingTop: 4 },

    center:      { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8 },
    loadingText: { fontSize: 13, color: C.mutedForeground },
    emptyWrap:   { alignItems: "center", paddingTop: 60, gap: 8 },
    emptyEmoji:  { fontSize: 56, marginBottom: 8 },
    emptyTitle:  { fontSize: 18, fontWeight: "800", color: C.foreground },
    emptySub: {
      fontSize: 13, color: C.mutedForeground,
      textAlign: "center", lineHeight: 20,
    },
    ctaBtn: {
      marginTop: 12,
      backgroundColor: C.accent,
      paddingHorizontal: 24, paddingVertical: 12,
      borderRadius: 12,
    },
    ctaBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },

    // ── Order Card ──
    card: {
      backgroundColor: C.surface2,
      borderWidth: 1, borderColor: C.border,
      borderRadius: 16, marginBottom: 12,
      overflow: "hidden",
    },
    cardStripe: { height: 3 },
    cardInner:  { padding: 16 },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    orderId:   { fontSize: 14, fontWeight: "800", color: C.foreground },
    orderDate: { fontSize: 11, color: C.mutedForeground, marginTop: 2 },
    typeTag: {
      borderWidth: 1, borderRadius: 99,
      paddingHorizontal: 8, paddingVertical: 2,
    },
    typeTagText: { fontSize: 10, fontWeight: "700" },
    statusBadge: {
      flexDirection: "row", alignItems: "center",
      gap: 5, paddingHorizontal: 10, paddingVertical: 5,
      borderRadius: 99,
    },
    statusIcon: { fontSize: 12 },
    statusText: { fontSize: 11, fontWeight: "700" },
    divider: { height: 1, backgroundColor: C.border, marginVertical: 10 },
    itemRow: {
      flexDirection: "row", alignItems: "center",
      marginBottom: 6, gap: 8,
    },
    itemDot:  { width: 5, height: 5, borderRadius: 3, backgroundColor: C.border },
    itemName: { flex: 1, fontSize: 12, color: C.mutedForeground },
    itemQty:  { fontSize: 11, color: C.subtleForeground },
    itemPrice: { fontSize: 12, fontWeight: "600", color: C.foreground },
    moreItems: { fontSize: 11, color: C.subtleForeground, marginBottom: 4, marginLeft: 13 },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalLabel: { fontSize: 10, color: C.subtleForeground, textTransform: "uppercase", letterSpacing: 0.5 },
    totalPrice: { fontSize: 16, fontWeight: "800", color: C.accent },
    detailBtn: {
      backgroundColor: `${C.accent}1A`,
      borderWidth: 1, borderColor: `${C.accent}40`,
      paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: 10,
    },
    detailBtnText: { fontSize: 12, fontWeight: "700", color: C.accent },
  });
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onPress }: { order: WCOrder; onPress: () => void }) {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const status = STATUS_CONFIG[order.status] ?? DEFAULT_STATUS;
  const type   = getOrderType(order as any);
  const tag    = TYPE_TAGS[type];
  const bg     = `${status.color}20`;

  const formatPrice = (v: string) =>
    Number(v).toLocaleString("tr-TR", { minimumFractionDigits: 2 });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Üst renk şeridi */}
      <View style={[styles.cardStripe, { backgroundColor: status.color }]} />

      <View style={styles.cardInner}>
        {/* Başlık */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <Text style={styles.orderId}>#{order.number}</Text>
              <View style={[styles.typeTag, { backgroundColor: `${status.color}18`, borderColor: `${status.color}35` }]}>
                <Text style={[styles.typeTagText, { color: status.color }]}>
                  {tag?.icon} {tag?.label}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>{formatDate(order.date_created)}</Text>
          </View>
          {/* Durum rozeti */}
          <View style={[styles.statusBadge, { backgroundColor: bg }]}>
            <Text style={styles.statusIcon}>{status.icon}</Text>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Ürün listesi */}
        {order.line_items.slice(0, 2).map(item => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemDot} />
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
            <Text style={styles.itemPrice}>{formatPrice(item.total)}₺</Text>
          </View>
        ))}
        {order.line_items.length > 2 && (
          <Text style={styles.moreItems}>+{order.line_items.length - 2} ürün daha</Text>
        )}

        <View style={styles.divider} />

        {/* Alt: toplam + detay butonu */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalPrice}>{formatPrice(order.total)} ₺</Text>
          </View>
          <TouchableOpacity style={styles.detailBtn} onPress={onPress}>
            <Text style={styles.detailBtnText}>Detay →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function OrdersScreen() {
  const router       = useRouter();
  const { user }     = useAuth();
  const insets       = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const { colors: C, isDark } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const [orders, setOrders]     = useState<WCOrder[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState<TabKey>("all");

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("fimarkt_token");
    if (token) {
      const data = await getMyOrders(token);
      setOrders(data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filtered =
    activeTab === "all"
      ? orders
      : orders.filter(o => getOrderType(o as any) === activeTab);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Başlık */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Siparişlerim</Text>
          <Text style={styles.subtitle}>{orders.length} sipariş</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Smart Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabScrollContent}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* İçerik */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.accent} size="large" />
          <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
        </View>
      ) : !user ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔐</Text>
          <Text style={styles.emptyTitle}>Giriş Yapın</Text>
          <Text style={styles.emptySub}>Siparişlerinizi görmek için giriş yapın</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/login" as never)}>
            <Text style={styles.ctaBtnText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={o => String(o.id)}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarHeight + 16 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>
                {activeTab === "all" ? "Henüz Sipariş Yok" : "Sipariş Bulunamadı"}
              </Text>
              <Text style={styles.emptySub}>
                {activeTab === "all"
                  ? "İlk siparişini vermek için mağazayı ziyaret et"
                  : "Bu kategoride siparişiniz bulunmuyor"}
              </Text>
              {activeTab === "all" && (
                <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/(tabs)" as never)}>
                  <Text style={styles.ctaBtnText}>Mağazaya Git</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => router.push(`/(account)/orders/${item.id}` as never)}
            />
          )}
        />
      )}
    </View>
  );
}
