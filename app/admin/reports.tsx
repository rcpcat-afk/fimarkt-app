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

export default function AdminReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStore, setActiveStore] = useState("fimarkt");

  const STORES = ["sanatkat", "fimarkt", "fidrop"];

  useEffect(() => {
    fetchStats();
  }, [activeStore]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/admin/reports?store=${activeStore}`,
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raporlar</Text>
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
      ) : !stats ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Veriler alınamadı</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Genel Özet</Text>
          <View style={styles.grid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📦</Text>
              <Text style={styles.statValue}>{stats.total_orders ?? "-"}</Text>
              <Text style={styles.statLabel}>Toplam Sipariş</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statValue}>
                {stats.total_sales
                  ? parseFloat(stats.total_sales).toLocaleString("tr-TR") + " ₺"
                  : "-"}
              </Text>
              <Text style={styles.statLabel}>Toplam Satış</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statValue}>
                {stats.total_customers ?? "-"}
              </Text>
              <Text style={styles.statLabel}>Müşteri</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🛍️</Text>
              <Text style={styles.statValue}>
                {stats.total_products ?? "-"}
              </Text>
              <Text style={styles.statLabel}>Ürün</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Sipariş Durumları</Text>
          <View style={styles.statusList}>
            {stats.orders_by_status &&
              Object.entries(stats.orders_by_status).map(
                ([status, count]: any) => (
                  <View key={status} style={styles.statusRow}>
                    <Text style={styles.statusLabel}>{status}</Text>
                    <Text style={styles.statusCount}>{count}</Text>
                  </View>
                ),
              )}
          </View>

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
  storeRow: { flexDirection: "row", gap: 8, padding: 16 },
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: "center",
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.accent,
    marginBottom: 4,
  },
  statLabel: { fontSize: 11, color: Colors.text2, textAlign: "center" },
  statusList: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusLabel: { fontSize: 13, color: Colors.text2 },
  statusCount: { fontSize: 14, fontWeight: "700", color: Colors.text },
});
