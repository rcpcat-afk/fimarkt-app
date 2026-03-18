import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BACKEND_URL, Colors } from "../../constants";
import { useAuth } from "../../src/store/AuthContext";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  processing: { label: "Hazırlanıyor", color: Colors.yellow },
  "on-hold": { label: "Beklemede", color: Colors.yellow },
  pending: { label: "Ödeme Bekleniyor", color: Colors.yellow },
  "hezarfen-shipped": { label: "Kargoda", color: "#3b82f6" },
  completed: { label: "Teslim Edildi", color: Colors.green },
  cancelled: { label: "İptal Edildi", color: Colors.red },
  refunded: { label: "İade Edildi", color: Colors.red },
};

const STORES = ["sanatkat", "fimarkt", "fidrop"];

export default function AdminOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStore, setActiveStore] = useState("fimarkt");

  useEffect(() => {
    fetchOrders();
  }, [activeStore]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = user?.token;

      const res = await fetch(
        `${BACKEND_URL}/api/admin/orders?store=${activeStore}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (str: string) => {
    const d = new Date(str);
    return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sipariş Yönetimi</Text>
      </View>

      <View style={styles.storeRow}>
        {STORES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.storeBtn,
              activeStore === s && styles.storeBtnActive,
            ]}
            onPress={() => setActiveStore(s)}
          >
            <Text
              style={[
                styles.storeBtnText,
                activeStore === s && styles.storeBtnTextActive,
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Sipariş bulunamadı</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || {
              label: order.status,
              color: Colors.text2,
            };
            return (
              <View key={order.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.orderNo}>#{order.number}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: status.color + "22",
                        borderColor: status.color + "55",
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.customerName}>
                  {order.billing?.first_name} {order.billing?.last_name}
                </Text>
                <Text style={styles.customerEmail}>{order.billing?.email}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.date}>
                    {formatDate(order.date_created)}
                  </Text>
                  <Text style={styles.total}>
                    {parseFloat(order.total).toLocaleString("tr-TR")} ₺
                  </Text>
                </View>
              </View>
            );
          })}
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 28,
    color: Colors.text,
    lineHeight: 32,
    marginTop: -2,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.text },
  storeRow: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
  },
  storeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  storeBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  storeBtnText: { fontSize: 12, color: Colors.text2, fontWeight: "600" },
  storeBtnTextActive: { color: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: Colors.text2, fontSize: 15 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  orderNo: { fontSize: 15, fontWeight: "700", color: Colors.text },
  statusBadge: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  customerName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "600",
    marginBottom: 2,
  },
  customerEmail: { fontSize: 12, color: Colors.text2, marginBottom: 8 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: 12, color: Colors.text3 },
  total: { fontSize: 15, fontWeight: "700", color: Colors.accent },
});
