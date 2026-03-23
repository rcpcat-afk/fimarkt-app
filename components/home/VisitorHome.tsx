import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { type ThemeColors } from "@/constants/theme";
import HeroSlider   from "@/components/home/HeroSlider";
import BentoBanners from "@/components/home/BentoBanners";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";

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
  const { colors: C, isDark } = useTheme();
  const router       = useRouter();
  const tabBarHeight = useTabBarHeight();
  const s      = makeStyles(C);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* ── 1. HERO SLİDER ──────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── 2. BENTO BANNERS ────────────────────────────────────────── */}
      <BentoBanners />

      {/* ── 3. BENTO GRİD ───────────────────────────────────────────── */}
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

      {/* ── 4. NASIL ÇALIŞIR ────────────────────────────────────────── */}
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

      {/* ── 5. VİTRİN — MAĞAZA ─────────────────────────────────────── */}
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

      {/* ── 6. VİTRİN — SANATKAT ───────────────────────────────────── */}
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

      {/* ── 7. FİNAL CTA ────────────────────────────────────────────── */}
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
function makeStyles(C: ThemeColors) {
  return StyleSheet.create({
    container:     { flex: 1, backgroundColor: C.background },

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
