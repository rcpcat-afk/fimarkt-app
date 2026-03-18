import { useRouter } from "expo-router";
import React from "react";
import {
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants";

const WHATSAPP_NUMBER = "905XXXXXXXXX"; // Buraya fimarkt numarasını yaz
const EMAIL = "info@fimarkt.com.tr";
const PHONE = "905XXXXXXXXX";

const CONTACT_OPTIONS = [
  {
    id: "whatsapp",
    icon: "💬",
    title: "WhatsApp",
    desc: "En hızlı yanıt için WhatsApp'tan yazın.",
    color: "#25d366",
    onPress: () => Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`),
  },
  {
    id: "email",
    icon: "📧",
    title: "E-posta",
    desc: EMAIL,
    color: "#6366f1",
    onPress: () => Linking.openURL(`mailto:${EMAIL}`),
  },
  {
    id: "phone",
    icon: "📞",
    title: "Telefon",
    desc: "Hafta içi 09:00 – 18:00",
    color: "#0ea5e9",
    onPress: () => Linking.openURL(`tel:${PHONE}`),
  },
];

const FAQ = [
  {
    q: "Siparişim ne zaman teslim edilir?",
    a: "3D baskı siparişleri 2–15 iş günü içinde teslim edilir. Kargo takibini Siparişlerim ekranından yapabilirsiniz.",
  },
  {
    q: "Dosyamı nasıl yüklerim?",
    a: "Üret sekmesinden 3D Baskı'yı seçip STL, OBJ veya diğer desteklenen formatları yükleyebilirsiniz.",
  },
  {
    q: "İade ve değişim yapabilir miyim?",
    a: "Kişiye özel üretilen ürünlerde iade yapılmamaktadır. Sanatkat ürünlerinde hasarlı/hatalı teslimat durumunda iade mümkündür.",
  },
  {
    q: "Fatura alabilir miyim?",
    a: "Evet, kurumsal müşterilerimiz için fatura düzenlenmektedir. Sipariş notuna fatura bilgilerinizi ekleyebilirsiniz.",
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Mesajlar</Text>
          <Text style={styles.headerSub}>Bize ulaşın</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>👋</Text>
          <Text style={styles.heroTitle}>Size nasıl yardımcı olabiliriz?</Text>
          <Text style={styles.heroSub}>
            Sorularınız için aşağıdaki kanallardan bize ulaşabilirsiniz.{"\n"}
            Ortalama yanıt süremiz{" "}
            <Text style={{ color: Colors.accent, fontWeight: "700" }}>
              1 saat
            </Text>
            .
          </Text>
        </View>

        {/* İletişim seçenekleri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İletişim Kanalları</Text>
          {CONTACT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={styles.contactCard}
              onPress={opt.onPress}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.contactIcon,
                  { backgroundColor: opt.color + "22" },
                ]}
              >
                <Text style={styles.contactEmoji}>{opt.icon}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{opt.title}</Text>
                <Text style={styles.contactDesc}>{opt.desc}</Text>
              </View>
              <Text style={[styles.contactArrow, { color: opt.color }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sık sorulan sorular */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
          {FAQ.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </View>

        {/* Çalışma saatleri */}
        <View style={styles.section}>
          <View style={styles.hoursCard}>
            <Text style={styles.hoursIcon}>🕐</Text>
            <View>
              <Text style={styles.hoursTitle}>Çalışma Saatleri</Text>
              <Text style={styles.hoursDesc}>
                Pazartesi – Cuma: 09:00 – 18:00
              </Text>
              <Text style={styles.hoursDesc}>Cumartesi: 10:00 – 14:00</Text>
              <Text style={[styles.hoursDesc, { color: Colors.text3 }]}>
                Pazar: Kapalı
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <TouchableOpacity
      style={styles.faqCard}
      onPress={() => setOpen(!open)}
      activeOpacity={0.85}
    >
      <View style={styles.faqTop}>
        <Text style={styles.faqQ}>{q}</Text>
        <Text style={styles.faqArrow}>{open ? "▲" : "▼"}</Text>
      </View>
      {open && <Text style={styles.faqA}>{a}</Text>}
    </TouchableOpacity>
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

  hero: {
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: "center",
  },
  heroEmoji: { fontSize: 40, marginBottom: 12 },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  heroSub: {
    fontSize: 13,
    color: Colors.text2,
    textAlign: "center",
    lineHeight: 20,
  },

  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text3,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 14,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  contactEmoji: { fontSize: 22 },
  contactInfo: { flex: 1 },
  contactTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  contactDesc: { fontSize: 12, color: Colors.text2 },
  contactArrow: { fontSize: 22, fontWeight: "700" },

  faqCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  faqTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQ: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginRight: 8,
  },
  faqArrow: { fontSize: 10, color: Colors.text3 },
  faqA: { fontSize: 12, color: Colors.text2, lineHeight: 18, marginTop: 10 },

  hoursCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
    alignItems: "flex-start",
  },
  hoursIcon: { fontSize: 24 },
  hoursTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  hoursDesc: { fontSize: 12, color: Colors.text2, marginBottom: 2 },
});
