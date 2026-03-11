import { useRouter } from "expo-router";
import React from "react";
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
import { useAuth } from "../../src/store/AuthContext";

const MENU_ITEMS = [
  {
    id: "orders",
    icon: "📦",
    title: "Sipariş Yönetimi",
    desc: "Tüm siparişleri görüntüle ve yönet",
    route: "/admin/orders",
  },
  {
    id: "products",
    icon: "🛍️",
    title: "Ürün Yönetimi",
    desc: "Ürün ekle, düzenle, sil",
    route: "/admin/products",
  },
  {
    id: "users",
    icon: "👥",
    title: "Kullanıcılar",
    desc: "Kullanıcı listesi ve yönetimi",
    route: "/admin/users",
  },
  {
    id: "notifications",
    icon: "🔔",
    title: "Bildirim Gönder",
    desc: "Tüm kullanıcılara push bildirim",
    route: "/admin/notifications",
  },
  {
    id: "settings",
    icon: "⚙️",
    title: "Uygulama Ayarları",
    desc: "Banner, öne çıkan ürünler, kampanyalar",
    route: "/admin/settings",
  },
  {
    id: "reports",
    icon: "📊",
    title: "Raporlar",
    desc: "Satış, kullanıcı, ürün istatistikleri",
    route: "/admin/reports",
  },
];

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚙️ Yönetim Paneli</Text>
          <Text style={styles.headerSub}>Hoş geldin, {user?.name}</Text>
        </View>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.text2, marginTop: 2 },
  adminBadge: {
    backgroundColor: Colors.accent + "22",
    borderColor: Colors.accent + "55",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  adminBadgeText: { color: Colors.accent, fontSize: 12, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  cardIcon: { fontSize: 28, marginBottom: 10 },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  cardDesc: { fontSize: 11, color: Colors.text2, lineHeight: 16 },
});
