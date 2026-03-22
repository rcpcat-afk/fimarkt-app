// ─── Bildirim Tercihleri — Auto-Save Toggle Matrix (App) ─────────────────────
// 6 konu × 3 kanal (Push / E-posta / SMS) = 18 native Switch
// Kaydet butonu YOK — her değişimde anında state + Animated fade Toast
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants";

// ─── Tipler ────────────────────────────────────────────────────────────────────
type Channel = "push" | "email" | "sms";
type Prefs   = Record<string, Record<Channel, boolean>>;

interface Topic    { key: string; label: string; hint: string }
interface Category { key: string; icon: string; label: string; topics: Topic[] }

// ─── Matris Konfigürasyonu ────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    key:   "orders",
    icon:  "📦",
    label: "Sipariş ve Teslimat",
    topics: [
      { key: "order_status", label: "Sipariş durumu güncellemesi", hint: "Onaylandı, hazırlandı veya iptal edildi." },
      { key: "shipping",     label: "Kargo ve teslimat takibi",    hint: "Kargoya verildi, yolda ve teslim edildi." },
    ],
  },
  {
    key:   "messages",
    icon:  "💬",
    label: "Mesajlar ve Teklifler",
    topics: [
      { key: "offer_received", label: "Yeni teklif geldi",  hint: "Kapatırsanız teklifleri geç görebilirsiniz." },
      { key: "chat_message",   label: "Mühendis mesajı",    hint: "Aktif sohbetlere gelen yeni mesajlar." },
    ],
  },
  {
    key:   "campaigns",
    icon:  "🎁",
    label: "Kampanya ve Fırsatlar",
    topics: [
      { key: "campaigns",  label: "Özel indirim ve kampanyalar", hint: "Sana özel indirim kodları ve fırsatlar." },
      { key: "price_drop", label: "Favori ürün fiyat düşüşü",   hint: "Favorilediğin ürün fiyatı düştüğünde." },
    ],
  },
];

const CHANNELS: { key: Channel; icon: string; label: string }[] = [
  { key: "push",  icon: "📱", label: "Push"    },
  { key: "email", icon: "✉️", label: "E-Posta" },
  { key: "sms",   icon: "💬", label: "SMS"     },
];

// ─── Başlangıç Prefs ──────────────────────────────────────────────────────────
const INITIAL_PREFS: Prefs = {
  order_status:   { push: true,  email: true,  sms: true  },
  shipping:       { push: true,  email: true,  sms: true  },
  offer_received: { push: true,  email: true,  sms: false },
  chat_message:   { push: true,  email: false, sms: false },
  campaigns:      { push: false, email: true,  sms: false },
  price_drop:     { push: true,  email: false, sms: false },
};

// ─── Animated Toast ───────────────────────────────────────────────────────────
function ToastBanner({ insetBottom }: { insetBottom: number }) {
  // exported as a hook-friendly component that receives the animated value externally
  return null; // rendered inline in parent
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [prefs, setPrefs] = useState<Prefs>(INITIAL_PREFS);

  // Toast
  const toastAnim  = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    Animated.timing(toastAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }, 1500);
  }, [toastAnim]);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const handleToggle = (topicKey: string, channel: Channel) => {
    setPrefs(prev => ({
      ...prev,
      [topicKey]: { ...prev[topicKey], [channel]: !prev[topicKey][channel] },
    }));
    showToast();
  };

  const toastTranslateY = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Bildirim Tercihleri</Text>
          <Text style={styles.subtitle}>Değişiklikler otomatik kaydedilir</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat, catIdx) => (
          <View key={cat.key} style={styles.section}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{cat.icon}</Text>
              <Text style={styles.sectionLabel}>{cat.label}</Text>
            </View>

            {/* Konu Kartı */}
            <View style={styles.card}>
              {cat.topics.map((topic, topicIdx) => (
                <View key={topic.key}>
                  {/* Konu başlığı + hint */}
                  <View style={styles.topicHeader}>
                    <Text style={styles.topicLabel}>{topic.label}</Text>
                    <Text style={styles.topicHint}>{topic.hint}</Text>
                  </View>

                  {/* 3 kanal toggle satırı */}
                  {CHANNELS.map((ch, chIdx) => {
                    const isLast = topicIdx === cat.topics.length - 1 && chIdx === CHANNELS.length - 1;
                    return (
                      <View
                        key={ch.key}
                        style={[
                          styles.row,
                          !isLast && styles.rowBorder,
                        ]}
                      >
                        <View style={styles.rowLeft}>
                          <Text style={styles.rowIcon}>{ch.icon}</Text>
                          <Text style={styles.rowLabel}>{ch.label}</Text>
                        </View>
                        <Switch
                          value={prefs[topic.key][ch.key]}
                          onValueChange={() => handleToggle(topic.key, ch.key)}
                          trackColor={{ false: Colors.border, true: `${Colors.accent}99` }}
                          thumbColor={prefs[topic.key][ch.key] ? Colors.accent : Colors.text3}
                          ios_backgroundColor={Colors.border}
                        />
                      </View>
                    );
                  })}

                  {/* Konu ayırıcı (son konu değilse) */}
                  {topicIdx < cat.topics.length - 1 && (
                    <View style={styles.topicDivider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Alt bilgi */}
        <Text style={styles.footerNote}>
          Push bildirimleri için cihazınızın bildirim izinleri açık olmalıdır.
          SMS bildirimleri kayıtlı telefon numaranıza gönderilir.
        </Text>
      </ScrollView>

      {/* Animated Toast — SafeArea üstünde */}
      <Animated.View
        style={[
          styles.toast,
          {
            bottom: insets.bottom + 16,
            opacity: toastAnim,
            transform: [{ translateY: toastTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.toastText}>✓  Kaydedildi</Text>
      </Animated.View>
    </View>
  );
}

// ─── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  backArrow:    { fontSize: 28, color: Colors.text, lineHeight: 32, marginTop: -2 },
  headerCenter: { flex: 1 },
  title:        { fontSize: 18, fontWeight: "800", color: Colors.text },
  subtitle:     { fontSize: 11, color: Colors.text2, marginTop: 1 },

  // List
  listContent: { paddingHorizontal: 16, paddingTop: 4 },

  // Section
  section:       { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 4, marginBottom: 8,
  },
  sectionIcon:  { fontSize: 16 },
  sectionLabel: { fontSize: 13, fontWeight: "800", color: Colors.text, textTransform: "uppercase", letterSpacing: 0.5 },

  // Card
  card: {
    backgroundColor: Colors.surface2,
    borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    overflow: "hidden",
  },

  // Topic header (konu başlığı + hint — kanallara üst başlık)
  topicHeader: {
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
  },
  topicLabel:   { fontSize: 13, fontWeight: "700", color: Colors.text },
  topicHint:    { fontSize: 11, color: Colors.text2, marginTop: 2, lineHeight: 16 },
  topicDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16, marginTop: 4 },

  // Toggle satırı
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLeft:   { flexDirection: "row", alignItems: "center", gap: 10 },
  rowIcon:   { fontSize: 15, width: 22, textAlign: "center" },
  rowLabel:  { fontSize: 13, fontWeight: "600", color: Colors.text },

  // Footer
  footerNote: {
    fontSize: 11, color: Colors.text3, textAlign: "center",
    lineHeight: 17, paddingHorizontal: 16, marginTop: 4,
  },

  // Toast
  toast: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: Colors.green,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 99,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: { fontSize: 13, fontWeight: "800", color: "#fff" },
});
