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

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "order",
    title: "Siparişiniz Kargoya Verildi",
    desc: "#12345 numaralı siparişiniz kargoya teslim edildi.",
    time: "2 saat önce",
    read: false,
    icon: "🚚",
    color: "#0ea5e9",
  },
  {
    id: "2",
    type: "order",
    title: "Siparişiniz Hazırlanıyor",
    desc: "#12344 numaralı siparişiniz üretim aşamasında.",
    time: "1 gün önce",
    read: false,
    icon: "⚙️",
    color: "#f59e0b",
  },
  {
    id: "3",
    type: "campaign",
    title: "Yeni Kampanya!",
    desc: "Sanatkat'ta seçili ürünlerde %20 indirim. Kaçırmayın!",
    time: "2 gün önce",
    read: true,
    icon: "🎉",
    color: Colors.accent,
  },
  {
    id: "4",
    type: "order",
    title: "Siparişiniz Teslim Edildi",
    desc: "#12340 numaralı siparişiniz teslim edildi. İyi günler!",
    time: "3 gün önce",
    read: true,
    icon: "✅",
    color: "#22c55e",
  },
  {
    id: "5",
    type: "system",
    title: "Profil Bilgilerinizi Güncelleyin",
    desc: "Daha iyi hizmet için adres bilgilerinizi tamamlayın.",
    time: "5 gün önce",
    read: true,
    icon: "👤",
    color: "#6366f1",
  },
  {
    id: "6",
    type: "campaign",
    title: "3D Baskı Fırsatı",
    desc: "Bu hafta verilen 3D baskı siparişlerinde ücretsiz kargo!",
    time: "1 hafta önce",
    read: true,
    icon: "🖨️",
    color: Colors.accent,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
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
          <Text style={styles.headerTitle}>Bildirimler</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>
              {unreadCount} okunmamış bildirim
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
            <Text style={styles.markAllText}>Tümünü Oku</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Okunmamışlar */}
        {notifications.filter((n) => !n.read).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yeni</Text>
            {notifications
              .filter((n) => !n.read)
              .map((n) => (
                <TouchableOpacity
                  key={n.id}
                  style={[styles.card, styles.cardUnread]}
                  onPress={() => markRead(n.id)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: n.color + "22" },
                    ]}
                  >
                    <Text style={styles.iconText}>{n.icon}</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle}>{n.title}</Text>
                      <Text style={styles.cardTime}>{n.time}</Text>
                    </View>
                    <Text style={styles.cardDesc}>{n.desc}</Text>
                  </View>
                  <View
                    style={[styles.unreadDot, { backgroundColor: n.color }]}
                  />
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* Okunmuşlar */}
        {notifications.filter((n) => n.read).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Önceki</Text>
            {notifications
              .filter((n) => n.read)
              .map((n) => (
                <TouchableOpacity
                  key={n.id}
                  style={styles.card}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: n.color + "11" },
                    ]}
                  >
                    <Text style={[styles.iconText, { opacity: 0.5 }]}>
                      {n.icon}
                    </Text>
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                      <Text style={[styles.cardTitle, { color: Colors.text2 }]}>
                        {n.title}
                      </Text>
                      <Text style={styles.cardTime}>{n.time}</Text>
                    </View>
                    <Text style={styles.cardDesc}>{n.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSub: { fontSize: 12, color: Colors.text2, marginTop: 1 },
  markAllBtn: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: { fontSize: 11, color: Colors.accent, fontWeight: "600" },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text3,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    position: "relative",
  },
  cardUnread: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 20 },
  cardContent: { flex: 1 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  cardTime: { fontSize: 11, color: Colors.text3 },
  cardDesc: { fontSize: 12, color: Colors.text2, lineHeight: 18 },
  unreadDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
