import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

import { Colors } from "../../constants";

const SERVICES = [
  {
    id: "3d-baski",
    icon: "🖨️",
    title: "3D Baskı",
    desc: "Dosyanı yükle, saniyeler içinde fiyat al ve üretime geç.",
    color: "#ff6b2b",
    badge: "Anında Fiyat",
    route: "/print-upload",
    params: { service: "3d-baski" },
  },
  {
    id: "3d-modelleme",
    icon: "🧊",
    title: "3D Modelleme",
    desc: "Fikrin veya referans görselinle profesyonel model tasarımı.",
    color: "#6366f1",
    badge: "Teklif Al",
    route: "/print-quote",
    params: { service: "3d-modelleme" },
  },
  {
    id: "3d-tarama",
    icon: "📡",
    title: "3D Tarama",
    desc: "Fiziksel nesnenin yüksek hassasiyetli dijital kopyası.",
    color: "#0ea5e9",
    badge: "Teklif Al",
    route: "/print-quote",
    params: { service: "3d-tarama" },
  },
  {
    id: "danismanlik",
    icon: "💡",
    title: "Danışmanlık",
    desc: "En doğru teknoloji ve malzeme seçimi için uzman desteği.",
    color: "#22c55e",
    badge: "Ücretsiz",
    route: "/print-quote",
    params: { service: "danismanlik" },
  },
  {
    id: "prototip",
    icon: "🔬",
    title: "Prototip Üretimi",
    desc: "Fonksiyon testi, sunum veya seri üretime hazırlık için prototip.",
    color: "#f59e0b",
    badge: "Teklif Al",
    route: "/print-quote",
    params: { service: "prototip" },
  },
  {
    id: "yedek-parca",
    icon: "⚙️",
    title: "Yedek Parça",
    desc: "Bulunamayan veya üretimi durmuş parçaları yeniden üret.",
    color: "#ec4899",
    badge: "Teklif Al",
    route: "/print-quote",
    params: { service: "yedek-parca" },
  },
];

const FEATURES = [
  { icon: "⚡", text: "Anında fiyat hesaplama" },
  { icon: "🏭", text: "FDM · SLA · SLS · Metal" },
  { icon: "🚚", text: "2-15 iş günü teslimat" },
  { icon: "🔒", text: "Güvenli dosya yükleme" },
];

export default function PrintScreen() {
  const router = useRouter();

  const handleServicePress = (service: (typeof SERVICES)[0]) => {
    router.push({
      pathname: service.route as any,
      params: service.params,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>3D Üretim</Text>
          <Text style={styles.headerSub}>Hizmet seç, üretime geç</Text>
        </View>
        <View style={styles.fidropBadge}>
          <Text style={styles.fidropText}>by fidrop</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTag}>FİDROP TEKNOLOJİSİ</Text>
            <Text style={styles.heroTitle}>Fikrin Varsa,{"\n"}Fidrop Var.</Text>
            <Text style={styles.heroSub}>
              3D baskıdan modellemeye, taramadan danışmanlığa — tek platform.
            </Text>
          </View>
          <Text style={styles.heroEmoji}>🖨️</Text>
        </View>

        {/* Özellikler */}
        <View style={styles.featuresRow}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Hizmet kartları */}
        <Text style={styles.sectionTitle}>Hizmetler</Text>

        <View style={styles.serviceGrid}>
          {SERVICES.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                { borderColor: service.color + "33" },
              ]}
              onPress={() => handleServicePress(service)}
              activeOpacity={0.85}
            >
              {/* Üst renkli şerit */}
              <View
                style={[styles.cardTopBar, { backgroundColor: service.color }]}
              />

              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: service.color + "22" },
                    ]}
                  >
                    <Text style={styles.cardIcon}>{service.icon}</Text>
                  </View>
                  <View
                    style={[
                      styles.badgeWrap,
                      { backgroundColor: service.color + "22" },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: service.color }]}>
                      {service.badge}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={styles.cardDesc}>{service.desc}</Text>

                <View
                  style={[styles.cardBtn, { backgroundColor: service.color }]}
                >
                  <Text style={styles.cardBtnText}>
                    {service.id === "3d-baski" ? "Fiyat Al →" : "Teklif Al →"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Alt bilgi */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            3D Baskı seçersen dosyanı yükleyip anında fiyat görürsün. Diğer
            hizmetler için uzman ekibimiz sana ulaşır.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - 52) / 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSub: { fontSize: 13, color: Colors.text2, marginTop: 2 },
  fidropBadge: {
    backgroundColor: Colors.accent + "22",
    borderColor: Colors.accent + "55",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  fidropText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  heroBanner: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.accent + "33",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  heroLeft: { flex: 1 },
  heroTag: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.accent,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSub: { fontSize: 12, color: Colors.text2, lineHeight: 18 },
  heroEmoji: { fontSize: 52, marginLeft: 12 },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  featureIcon: { fontSize: 12 },
  featureText: { fontSize: 11, color: Colors.text2, fontWeight: "500" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 14,
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  serviceCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardTopBar: {
    height: 4,
  },
  cardContent: {
    padding: 14,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIcon: { fontSize: 20 },
  badgeWrap: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 9, fontWeight: "700", letterSpacing: 0.3 },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 11,
    color: Colors.text2,
    lineHeight: 16,
    marginBottom: 14,
  },
  cardBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  cardBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
    alignItems: "flex-start",
  },
  infoIcon: { fontSize: 16, marginTop: 1 },
  infoText: { flex: 1, fontSize: 12, color: Colors.text2, lineHeight: 18 },
});
