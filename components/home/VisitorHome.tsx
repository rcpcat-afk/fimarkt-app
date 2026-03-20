import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, StatusBar,
} from "react-native";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/theme";

const { width } = Dimensions.get("window");

// ── Mock vitrin verisi ────────────────────────────────────────────────────────
const MOCK_MAGAZA = [
  { emoji: "🧵", name: "PLA Filament 1kg",  price: "285₺",   tag: "Çok Satan" },
  { emoji: "⚙️", name: "Ekstruder Nozzle",  price: "145₺",   tag: "Yeni"      },
  { emoji: "🛠️", name: "Bed Leveling Yayı", price: "89₺",    tag: ""          },
  { emoji: "🔩", name: "PTFE Tüp 1m",        price: "65₺",    tag: "İndirim"   },
  { emoji: "🖨️", name: "Kapton Bant",        price: "45₺",    tag: ""          },
];
const MOCK_SANATKAT = [
  { emoji: "🏛️", name: "Apollo Heykeli", price: "4.955₺", tag: "Özel Üretim" },
  { emoji: "🐺", name: "Anubis Figürü",  price: "2.850₺", tag: "Popüler"     },
  { emoji: "🦁", name: "Aslan Büstü",    price: "3.200₺", tag: ""            },
  { emoji: "🦅", name: "Kartal Heykeli", price: "1.750₺", tag: "Yeni"        },
  { emoji: "🐉", name: "Ejderha Figürü", price: "2.100₺", tag: ""            },
];

// ── Bento kartları ────────────────────────────────────────────────────────────
const BENTO = [
  { id: "fidrop",      emoji: "🚀", title: "Fidrop",      desc: "STL yükle, anında fiyat al.",  color: "#7c3aed", href: "/(tabs)/print"  as const },
  { id: "muhendislik", emoji: "🔧", title: "Mühendislik", desc: "Prototip ve modelleme.",        color: "#0ea5e9", href: "/(tabs)/print"  as const },
  { id: "magaza",      emoji: "🛍️", title: "Mağaza",      desc: "Filament ve ekipman.",          color: "#ff6b2b", href: "/(tabs)/shop"   as const },
  { id: "sanatkat",    emoji: "🏛️", title: "Sanatkat",    desc: "Özgün 3D sanat eserleri.",      color: "#a855f7", href: "/(tabs)/shop"   as const },
];

const HOW_STEPS = [
  { icon: "📐", title: "İhtiyacını Belirle", desc: "Ne istediğini seç." },
  { icon: "🚀", title: "Sipariş Ver",         desc: "Fiyat al, ödeme yap." },
  { icon: "📦", title: "Kapında Olsun",       desc: "Kargonu takip et."    },
];

export default function VisitorHome() {
  const scheme = useColorScheme();
  const C      = Colors[scheme ?? "dark"];
  const router = useRouter();
  const s      = makeStyles(C);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle={scheme === "light" ? "dark-content" : "light-content"} />

      {/* ── 1. HERO ─────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(500)} style={s.heroSection}>
        {/* Dekoratif glow */}
        <View style={s.heroGlow1} />
        <View style={s.heroGlow2} />

        <View style={s.heroBadgeWrap}>
          <Text style={s.heroBadgeText}>🏭 Türkiye'nin 3D Ekosistemi</Text>
        </View>
        <Text style={s.heroTitle}>
          Fikrinden <Text style={s.heroAccent}>Ürüne</Text>,{"\n"}Saniyeler İçinde.
        </Text>
        <Text style={s.heroSub}>
          3D baskı siparişi ver, benzersiz sanat eserleri keşfet, mühendislik hizmetleri al — hepsi tek platformda.
        </Text>

        {/* CTA butonları */}
        <View style={s.heroCtas}>
          <TouchableOpacity style={s.ctaPrimary} onPress={() => router.push("/(tabs)/print")}>
            <Text style={s.ctaPrimaryText}>🚀 Hemen Teklif Al</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.ctaSecondary} onPress={() => router.push("/(tabs)/shop")}>
            <Text style={s.ctaSecondaryText}>Keşfet →</Text>
          </TouchableOpacity>
        </View>

        {/* İstatistikler */}
        <View style={s.statsRow}>
          {[["500+","Baskı"], ["200+","Eser"], ["50+","Müh."], ["4.8★","Puan"]].map(([num, label]) => (
            <View key={label} style={s.statItem}>
              <Text style={s.statNum}>{num}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* ── 2. BENTO GRİD ───────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={s.section}>
        <Text style={s.sectionTitle}>Tüm İhtiyaçların Burada</Text>
        <Text style={s.sectionSub}>Üretimden sanata, alışverişten danışmanlığa</Text>
        <View style={s.bentoGrid}>
          {BENTO.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[s.bentoCard, { borderColor: `${item.color}40`, backgroundColor: `${item.color}12` }]}
              onPress={() => router.push(item.href)}
              activeOpacity={0.85}
            >
              <Text style={s.bentoEmoji}>{item.emoji}</Text>
              <Text style={[s.bentoTitle, { color: item.color }]}>{item.title}</Text>
              <Text style={s.bentoDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* ── 3. NASIL ÇALIŞIR ────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(150).duration(500)} style={[s.section, s.howSection]}>
        <Text style={s.sectionTitle}>Nasıl Çalışır?</Text>
        <Text style={s.sectionSub}>3 adımda hayalinden ürüne</Text>
        <View style={s.stepsRow}>
          {HOW_STEPS.map((step, i) => (
            <View key={step.title} style={s.stepItem}>
              <View style={s.stepIconWrap}>
                <Text style={s.stepIcon}>{step.icon}</Text>
                <View style={s.stepNum}>
                  <Text style={s.stepNumText}>{i + 1}</Text>
                </View>
              </View>
              <Text style={s.stepTitle}>{step.title}</Text>
              <Text style={s.stepDesc}>{step.desc}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* ── 4. VİTRİN — MAĞAZA ─────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={s.section}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>🛍️ Mağaza'dan Seçmeler</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/shop")}>
            <Text style={s.sectionMore}>Tümü →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carouselContent}>
          {MOCK_MAGAZA.map((p, i) => (
            <View key={i} style={s.productCard}>
              {p.tag ? <View style={s.productTag}><Text style={s.productTagText}>{p.tag}</Text></View> : null}
              <View style={s.productImg}><Text style={s.productEmoji}>{p.emoji}</Text></View>
              <View style={s.productInfo}>
                <Text style={s.productName} numberOfLines={2}>{p.name}</Text>
                <Text style={s.productPrice}>{p.price}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* ── 5. VİTRİN — SANATKAT ───────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(250).duration(500)} style={s.section}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>🏛️ Sanatkat'tan Eserler</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/shop")}>
            <Text style={s.sectionMore}>Tümü →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carouselContent}>
          {MOCK_SANATKAT.map((p, i) => (
            <View key={i} style={s.productCard}>
              {p.tag ? <View style={s.productTag}><Text style={s.productTagText}>{p.tag}</Text></View> : null}
              <View style={s.productImg}><Text style={s.productEmoji}>{p.emoji}</Text></View>
              <View style={s.productInfo}>
                <Text style={s.productName} numberOfLines={2}>{p.name}</Text>
                <Text style={s.productPrice}>{p.price}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* ── 6. FİNAL CTA ────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={s.ctaBanner}>
        <Text style={s.ctaBannerEmoji}>🏭</Text>
        <Text style={s.ctaBannerTitle}>Fimarkt'a Katıl</Text>
        <Text style={s.ctaBannerSub}>Ücretsiz hesap oluştur, 3D ekosisteme dahil ol.</Text>
        <TouchableOpacity style={s.ctaBannerBtn} onPress={() => router.push("/(auth)/register" as any)}>
          <Text style={s.ctaBannerBtnText}>Ücretsiz Başla →</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Dinamik stiller ───────────────────────────────────────────────────────────
function makeStyles(C: typeof Colors.dark) {
  return StyleSheet.create({
    container:     { flex: 1, backgroundColor: C.background },

    // Hero
    heroSection:   { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 32, alignItems: "center", position: "relative" },
    heroGlow1:     { position: "absolute", top: 60,  left: width * 0.1,  width: 280, height: 280, borderRadius: 140, backgroundColor: C.accent,          opacity: 0.04 },
    heroGlow2:     { position: "absolute", top: 100, right: width * 0.1, width: 200, height: 200, borderRadius: 100, backgroundColor: "#7c3aed",          opacity: 0.04 },
    heroBadgeWrap: { backgroundColor: `${C.accent}18`, borderWidth: 1, borderColor: `${C.accent}40`, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 16 },
    heroBadgeText: { fontSize: 11, fontWeight: "700", color: C.accent },
    heroTitle:     { fontSize: 28, fontWeight: "900", color: C.foreground, letterSpacing: -0.8, lineHeight: 36, textAlign: "center", marginBottom: 12 },
    heroAccent:    { color: C.accent },
    heroSub:       { fontSize: 13, color: C.mutedForeground, lineHeight: 20, textAlign: "center", marginBottom: 24, maxWidth: 300 },
    heroCtas:      { flexDirection: "row", gap: 10, marginBottom: 28 },
    ctaPrimary:    { backgroundColor: C.accent, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 16 },
    ctaPrimaryText:{ fontSize: 13, fontWeight: "700", color: "#fff" },
    ctaSecondary:  { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 16 },
    ctaSecondaryText: { fontSize: 13, fontWeight: "600", color: C.foreground },
    statsRow:      { flexDirection: "row", gap: 20 },
    statItem:      { alignItems: "center" },
    statNum:       { fontSize: 18, fontWeight: "800", color: C.foreground },
    statLabel:     { fontSize: 10, color: C.mutedForeground, marginTop: 1 },

    // Sections
    section:       { paddingHorizontal: 16, marginTop: 8 },
    sectionRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle:  { fontSize: 15, fontWeight: "700", color: C.foreground, marginBottom: 2 },
    sectionSub:    { fontSize: 11, color: C.mutedForeground, marginBottom: 12 },
    sectionMore:   { fontSize: 12, color: C.accent },

    // Bento
    bentoGrid:     { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    bentoCard:     { width: (width - 42) / 2, borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 2 },
    bentoEmoji:    { fontSize: 28, marginBottom: 8 },
    bentoTitle:    { fontSize: 14, fontWeight: "700", marginBottom: 4 },
    bentoDesc:     { fontSize: 11, color: C.mutedForeground, lineHeight: 16 },

    // How it works
    howSection:    { backgroundColor: C.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.border, paddingVertical: 20, marginTop: 20 },
    stepsRow:      { flexDirection: "row", gap: 8 },
    stepItem:      { flex: 1, alignItems: "center" },
    stepIconWrap:  { position: "relative", marginBottom: 8 },
    stepIcon:      { fontSize: 28 },
    stepNum:       { position: "absolute", top: -4, right: -8, width: 18, height: 18, borderRadius: 9, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" },
    stepNumText:   { fontSize: 9, fontWeight: "900", color: "#fff" },
    stepTitle:     { fontSize: 11, fontWeight: "700", color: C.foreground, textAlign: "center", marginBottom: 2 },
    stepDesc:      { fontSize: 9,  color: C.mutedForeground, textAlign: "center", lineHeight: 13 },

    // Carousel
    carouselContent: { paddingRight: 16 },
    productCard:   { width: 140, marginRight: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: "hidden" },
    productTag:    { position: "absolute", top: 8, left: 8, zIndex: 1, backgroundColor: C.accent, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
    productTagText:{ fontSize: 8, fontWeight: "700", color: "#fff" },
    productImg:    { width: "100%", height: 96, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center" },
    productEmoji:  { fontSize: 38 },
    productInfo:   { padding: 10 },
    productName:   { fontSize: 11, color: C.foreground, marginBottom: 4, lineHeight: 15 },
    productPrice:  { fontSize: 13, fontWeight: "700", color: C.accent },

    // Final CTA
    ctaBanner:     { margin: 16, borderRadius: 24, borderWidth: 1, borderColor: `${C.accent}30`, backgroundColor: `${C.accent}10`, padding: 28, alignItems: "center" },
    ctaBannerEmoji:{ fontSize: 40, marginBottom: 10 },
    ctaBannerTitle:{ fontSize: 22, fontWeight: "900", color: C.foreground, marginBottom: 6 },
    ctaBannerSub:  { fontSize: 12, color: C.mutedForeground, textAlign: "center", marginBottom: 20, lineHeight: 18 },
    ctaBannerBtn:  { backgroundColor: C.accent, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16 },
    ctaBannerBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  });
}
