import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants";
import { getMyOrders, WCOrder } from "../../src/services/api";
import { useAuth } from "../../src/store/AuthContext";
import { useTabBarHeight } from "../../hooks/useTabBarHeight";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  processing: {
    label: "Hazırlanıyor",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    icon: "⏳",
  },
  "on-hold": {
    label: "Beklemede",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    icon: "⏸️",
  },
  pending: {
    label: "Ödeme Bekleniyor",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    icon: "💳",
  },
  shipped: {
    label: "Kargoda",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    icon: "🚚",
  },
  completed: {
    label: "Teslim Edildi",
    color: Colors.green,
    bg: "rgba(34,197,94,0.12)",
    icon: "✅",
  },
  cancelled: {
    label: "İptal Edildi",
    color: Colors.red,
    bg: "rgba(239,68,68,0.12)",
    icon: "❌",
  },
  refunded: {
    label: "İade Edildi",
    color: Colors.red,
    bg: "rgba(239,68,68,0.12)",
    icon: "↩️",
  },
  "hezarfen-shipped": {
    label: "Kargoda",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    icon: "🚚",
  },
};

const DEFAULT_STATUS = {
  label: "Bilinmiyor",
  color: Colors.text2,
  bg: Colors.surface2,
  icon: "❓",
};

const TAB_FILTERS = [
  { key: "all", label: "Tümü" },
  { key: "processing", label: "Hazırlanıyor" },
  { key: "hezarfen-shipped", label: "Kargoda" },
  { key: "completed", label: "Teslim Edildi" },
  { key: "cancelled", label: "İptal Edildi" },
] as const;

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const tabBarHeight = useTabBarHeight();
  const [orders, setOrders] = useState<WCOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

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
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price: string) =>
    Number(price).toLocaleString("tr-TR", { minimumFractionDigits: 2 });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Başlık */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Siparişlerim</Text>
          <Text style={styles.sub}>{orders.length} sipariş</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Tab filtreler */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {TAB_FILTERS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
          <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
        </View>
      ) : !user ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔐</Text>
          <Text style={styles.emptyTitle}>Giriş Yapın</Text>
          <Text style={styles.emptySub}>
            Siparişlerinizi görmek için giriş yapın
          </Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.actionBtnText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarHeight }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
            />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>
                {activeTab === "all"
                  ? "Henüz Sipariş Yok"
                  : "Sipariş Bulunamadı"}
              </Text>
              <Text style={styles.emptySub}>
                {activeTab === "all"
                  ? "İlk siparişini vermek için mağazayı ziyaret et"
                  : "Bu kategoride siparişiniz bulunmuyor"}
              </Text>
              {activeTab === "all" && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => router.push("/(tabs)")}
                >
                  <Text style={styles.actionBtnText}>Mağazaya Git</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filtered.map((order) => {
              const status = STATUS_CONFIG[order.status] || DEFAULT_STATUS;
              return (
                <View key={order.id} style={styles.card}>
                  {/* Kart üst çizgi */}
                  <View
                    style={[
                      styles.cardTopBar,
                      { backgroundColor: status.color },
                    ]}
                  />

                  <View style={styles.cardInner}>
                    {/* Header */}
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.orderId}>
                          Sipariş #{order.number}
                        </Text>
                        <Text style={styles.orderDate}>
                          {formatDate(order.date_created)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: status.bg },
                        ]}
                      >
                        <Text style={styles.statusIcon}>{status.icon}</Text>
                        <Text
                          style={[styles.statusText, { color: status.color }]}
                        >
                          {status.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Ürünler */}
                    {order.line_items.slice(0, 3).map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <View style={styles.itemDot} />
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemQty}>x{item.quantity}</Text>
                        <Text style={styles.itemPrice}>
                          {formatPrice(item.total)}₺
                        </Text>
                      </View>
                    ))}
                    {order.line_items.length > 3 && (
                      <Text style={styles.moreItems}>
                        +{order.line_items.length - 3} ürün daha
                      </Text>
                    )}

                    <View style={styles.divider} />

                    {/* Alt satır */}
                    <View style={styles.cardFooter}>
                      <View style={styles.sourceTag}>
                        <Text style={styles.sourceTagText}>🏛️ Sanatkat</Text>
                      </View>
                      <Text style={styles.totalText}>
                        Toplam:{" "}
                        <Text style={styles.totalPrice}>
                          {formatPrice(order.total)}₺
                        </Text>
                      </Text>
                    </View>

                    {/* Kargo takip butonu */}
                    {(order.status === "shipped" ||
                      order.status === "hezarfen-shipped") && (
                      <TouchableOpacity style={styles.trackBtn}>
                        <Text style={styles.trackBtnText}>
                          🚚 Kargo Takip Et
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  sub: { fontSize: 12, color: Colors.text2, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshIcon: { fontSize: 18, color: Colors.text2 },
  tabScroll: { flexGrow: 0, flexShrink: 0, marginBottom: 12 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  tabActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  tabText: { fontSize: 12, fontWeight: "500", color: Colors.text2 },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  list: { paddingHorizontal: 16 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 8,
  },
  loadingText: { fontSize: 13, color: Colors.text2 },
  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: Colors.text },
  emptySub: {
    fontSize: 13,
    color: Colors.text2,
    textAlign: "center",
    lineHeight: 20,
  },
  actionBtn: {
    marginTop: 12,
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  card: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardTopBar: { height: 3 },
  cardInner: { padding: 16 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: { fontSize: 14, fontWeight: "800", color: Colors.text },
  orderDate: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  statusIcon: { fontSize: 12 },
  statusText: { fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  itemDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  itemName: { flex: 1, fontSize: 12, color: Colors.text2 },
  itemQty: { fontSize: 11, color: Colors.text3 },
  itemPrice: { fontSize: 12, fontWeight: "600", color: Colors.text },
  moreItems: {
    fontSize: 11,
    color: Colors.text3,
    marginBottom: 4,
    marginLeft: 13,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourceTag: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sourceTagText: { fontSize: 11, color: Colors.text3 },
  totalText: { fontSize: 13, color: Colors.text2 },
  totalPrice: { fontSize: 14, fontWeight: "800", color: Colors.accent },
  trackBtn: {
    marginTop: 10,
    backgroundColor: "rgba(59,130,246,0.12)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  trackBtnText: { fontSize: 13, fontWeight: "600", color: "#3b82f6" },
});
