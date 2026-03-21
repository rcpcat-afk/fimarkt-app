// ─── Fidrop Tab — Premium Landing (App) ───────────────────────────────────────
// Temiz yenileme: Colors.dark token sistemi, Reanimated entering animasyonlar,
// Sticky bottom CTA (ScrollView dışında, flex kolonunda).

import { useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";

// ── Tema ─────────────────────────────────────────────────────────────────────
const C = Colors.dark;

// ── Veri ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", icon: "📁", title: "Dosyayı Yükle",         desc: "STL, OBJ veya STEP formatını seç." },
  { n: "02", icon: "⚙️", title: "Teknoloji & Malzeme",   desc: "13+ teknoloji, 50+ malzeme." },
  { n: "03", icon: "⚡", title: "Anında Fiyat Al",        desc: "AI motor saniyeler içinde hesaplar." },
  { n: "04", icon: "📦", title: "Kapında",                desc: "Kalite kontrollü, hızlı teslimat." },
];

const TECHS = [
  { id: "fdm",   name: "FDM",    sub: "Filament",  color: C.accent,    icon: "🖨️",  tag: "En Popüler" },
  { id: "sla",   name: "Reçine", sub: "SLA / DLP", color: "#0ea5e9",   icon: "💎",  tag: "Yüksek Detay" },
  { id: "sls",   name: "Toz",    sub: "SLS / MJF", color: "#a855f7",   icon: "🌪️",  tag: "Endüstriyel" },
  { id: "metal", name: "Metal",  sub: "DMLS",       color: "#f59e0b",   icon: "🔩",  tag: "Premium" },
];

const TRUSTS = [
  { icon: "🔐", title: "NDA Gizliliği",        desc: "Dosyaların şifreli, imzalı sözleşmeyle korunur." },
  { icon: "🎯", title: "CMM Kalite Kontrolü",  desc: "Her parça ölçüm raporuyla onaylanır." },
  { icon: "🏅", title: "ISO 9001 Üreticiler",  desc: "Tüm ortaklar sertifikalı ve denetlenir." },
  { icon: "⚡", title: "Anında Fiyat",          desc: "Trimesh AI motoru saniyeler içinde hesaplar." },
];

// ── Sayfa ─────────────────────────────────────────────────────────────────────
export default function FidropScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.root, { backgroundColor: C.background }]}>

      {/* ── Scroll içeriği ────────────────────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* HERO ─────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(60).duration(500)} style={[s.heroBg, { borderColor: C.accent + "33" }]}>
          {/* Arka plan glow */}
          <View style={[s.heroGlow, { backgroundColor: C.accent + "18" }]} />

          <View style={s.heroInner}>
            {/* Rozet */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <View style={[s.heroBadge, { backgroundColor: C.accent + "18", borderColor: C.accent + "44" }]}>
                <View style={[s.heroBadgeDot, { backgroundColor: C.accent }]} />
                <Text style={[s.heroBadgeText, { color: C.accent }]}>FIDROP — 3D ÜRETİM FABRİKASI</Text>
              </View>
            </Animated.View>

            {/* Başlık */}
            <Animated.View entering={FadeInDown.delay(180).duration(500)}>
              <Text style={[s.heroTitle, { color: C.foreground }]}>
                Fikrin Varsa,{"\n"}
                <Text style={{ color: C.accent }}>Fidrop</Text> Var.
              </Text>
            </Animated.View>

            {/* Alt başlık */}
            <Animated.View entering={FadeInDown.delay(240).duration(500)}>
              <Text style={[s.heroSub, { color: C.mutedForeground }]}>
                STL yükle, teknoloji seç — AI motorumuz saniyeler içinde kesin fiyatını verir.
              </Text>
            </Animated.View>

            {/* Stats şeridi */}
            <Animated.View entering={FadeInDown.delay(320).duration(400)} style={[s.statsRow, { borderTopColor: C.border }]}>
              {[
                { val: "13+",     label: "Teknoloji"    },
                { val: "50+",     label: "Malzeme"      },
                { val: "±0.05mm", label: "Hassasiyet"   },
                { val: "2–15",    label: "İş Günü"      },
              ].map((stat) => (
                <View key={stat.label} style={s.statItem}>
                  <Text style={[s.statVal, { color: C.foreground }]}>{stat.val}</Text>
                  <Text style={[s.statLabel, { color: C.mutedForeground }]}>{stat.label}</Text>
                </View>
              ))}
            </Animated.View>
          </View>
        </Animated.View>

        {/* HOW IT WORKS ──────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(380).duration(500)}>
          <Text style={[s.sectionTag, { color: C.accent }]}>NASIL ÇALIŞIR?</Text>
          <Text style={[s.sectionTitle, { color: C.foreground }]}>4 Adımda Teslimata</Text>
        </Animated.View>

        <View style={s.stepsGrid}>
          {STEPS.map((step, i) => (
            <Animated.View
              key={step.n}
              entering={FadeInDown.delay(420 + i * 70).duration(450)}
              style={[s.stepCard, { backgroundColor: C.surface, borderColor: C.border }]}
            >
              <View style={s.stepTop}>
                <View style={[s.stepIconWrap, { backgroundColor: C.accent + "18", borderColor: C.accent + "33" }]}>
                  <Text style={s.stepIcon}>{step.icon}</Text>
                </View>
                <Text style={[s.stepNum, { color: C.accent + "40" }]}>{step.n}</Text>
              </View>
              <Text style={[s.stepTitle, { color: C.foreground }]}>{step.title}</Text>
              <Text style={[s.stepDesc, { color: C.mutedForeground }]}>{step.desc}</Text>
            </Animated.View>
          ))}
        </View>

        {/* TECH SHOWCASE ─────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(640).duration(500)}>
          <Text style={[s.sectionTag, { color: C.accent }]}>TEKNOLOJİ KADROMUZ</Text>
          <Text style={[s.sectionTitle, { color: C.foreground }]}>Her İhtiyaç İçin</Text>
        </Animated.View>

        <View style={s.techGrid}>
          {TECHS.map((tech, i) => (
            <Animated.View
              key={tech.id}
              entering={FadeInDown.delay(680 + i * 60).duration(420)}
              style={[s.techCard, { backgroundColor: C.surface, borderColor: tech.color + "33" }]}
            >
              {/* Renk üst şeridi */}
              <View style={[s.techBar, { backgroundColor: tech.color }]} />

              <View style={s.techInner}>
                <View style={[s.techIconWrap, { backgroundColor: tech.color + "20" }]}>
                  <Text style={s.techIcon}>{tech.icon}</Text>
                </View>
                <View style={[s.techTagWrap, { backgroundColor: tech.color + "18" }]}>
                  <Text style={[s.techTagText, { color: tech.color }]}>{tech.tag}</Text>
                </View>
                <Text style={[s.techName, { color: tech.color }]}>{tech.name}</Text>
                <Text style={[s.techSub, { color: C.mutedForeground }]}>{tech.sub}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* TRUST ────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(900).duration(500)}>
          <Text style={[s.sectionTag, { color: C.accent }]}>GÜVEN & KALİTE</Text>
          <Text style={[s.sectionTitle, { color: C.foreground }]}>Kurumsal Güvencemiz</Text>
        </Animated.View>

        <View style={s.trustList}>
          {TRUSTS.map((t, i) => (
            <Animated.View
              key={t.title}
              entering={FadeInDown.delay(940 + i * 60).duration(420)}
              style={[s.trustCard, { backgroundColor: C.surface, borderColor: C.border }]}
            >
              <View style={[s.trustIconWrap, { backgroundColor: C.accent + "18", borderColor: C.accent + "33" }]}>
                <Text style={s.trustIcon}>{t.icon}</Text>
              </View>
              <View style={s.trustText}>
                <Text style={[s.trustTitle, { color: C.foreground }]}>{t.title}</Text>
                <Text style={[s.trustDesc, { color: C.mutedForeground }]}>{t.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Alt padding (sticky CTA için) */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── STICKY BOTTOM CTA ─────────────────────────────────────────── */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(500)}
        style={[
          s.stickyBar,
          {
            backgroundColor: C.background,
            borderTopColor: C.border,
            paddingBottom: Math.max(insets.bottom, 12) + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={[s.ctaBtn, { backgroundColor: C.accent }]}
          onPress={() => router.push("/(print)/print-upload" as never)}
          activeOpacity={0.88}
        >
          <Text style={s.ctaBtnText}>🚀  STL Yükle ve Anında Fiyat Al</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.ctaSecondary, { borderColor: C.border }]}
          onPress={() => router.push("/(print)/tasarim-iste" as never)}
          activeOpacity={0.8}
        >
          <Text style={[s.ctaSecondaryText, { color: C.mutedForeground }]}>✏️ Tasarımın Yok Mu? Çizdirelim!</Text>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:         { flex: 1 },
  scroll:       { flex: 1 },
  scrollContent:{ paddingHorizontal: 16, paddingTop: 12 },

  // Hero
  heroBg: {
    borderRadius: 24,
    borderWidth:  1,
    overflow:     "hidden",
    marginBottom: 28,
  },
  heroGlow: {
    position:     "absolute",
    top:          -60,
    left:         "50%",
    width:        280,
    height:       280,
    borderRadius: 140,
    marginLeft:   -140,
  },
  heroInner:    { padding: 24, paddingBottom: 20 },
  heroBadge: {
    flexDirection:    "row",
    alignItems:       "center",
    gap:              6,
    alignSelf:        "flex-start",
    borderWidth:      1,
    borderRadius:     20,
    paddingHorizontal:10,
    paddingVertical:  5,
    marginBottom:     16,
  },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3 },
  heroBadgeText:{ fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  heroTitle: {
    fontSize:     30,
    fontWeight:   "900",
    letterSpacing:-0.5,
    lineHeight:   36,
    marginBottom: 10,
  },
  heroSub: {
    fontSize:     13,
    lineHeight:   20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop:     16,
    marginTop:      4,
  },
  statItem:  { alignItems: "center" },
  statVal:   { fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  statLabel: { fontSize: 10, marginTop: 2 },

  // Section başlıkları
  sectionTag: {
    fontSize:    10,
    fontWeight:  "800",
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize:    20,
    fontWeight:  "900",
    letterSpacing:-0.3,
    marginBottom: 16,
  },

  // Adımlar
  stepsGrid: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           10,
    marginBottom:  28,
  },
  stepCard: {
    width:         "47.5%",
    borderRadius:  16,
    borderWidth:   1,
    padding:       14,
  },
  stepTop: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    marginBottom:   10,
  },
  stepIconWrap: {
    width: 40, height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIcon:  { fontSize: 18 },
  stepNum:   { fontSize: 22, fontWeight: "900" },
  stepTitle: { fontSize: 12, fontWeight: "800", marginBottom: 4 },
  stepDesc:  { fontSize: 11, lineHeight: 16 },

  // Teknolojiler
  techGrid: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           10,
    marginBottom:  28,
  },
  techCard: {
    width:        "47.5%",
    borderRadius: 16,
    borderWidth:  1,
    overflow:     "hidden",
  },
  techBar:     { height: 3 },
  techInner:   { padding: 14 },
  techIconWrap:{
    width: 44, height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  techIcon: { fontSize: 22 },
  techTagWrap: {
    alignSelf:       "flex-start",
    borderRadius:    8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom:    8,
  },
  techTagText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.4 },
  techName: { fontSize: 16, fontWeight: "900", marginBottom: 2 },
  techSub:  { fontSize: 11 },

  // Güven
  trustList:  { gap: 10, marginBottom: 28 },
  trustCard: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           14,
    borderRadius:  16,
    borderWidth:   1,
    padding:       14,
  },
  trustIconWrap: {
    width: 44, height: 44,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shrink: 0,
  } as never,
  trustIcon:  { fontSize: 20 },
  trustText:  { flex: 1 },
  trustTitle: { fontSize: 13, fontWeight: "800", marginBottom: 3 },
  trustDesc:  { fontSize: 11, lineHeight: 16 },

  // Sticky CTA
  stickyBar: {
    paddingHorizontal: 16,
    paddingTop:        12,
    borderTopWidth:    1,
    gap:               8,
  },
  ctaBtn: {
    borderRadius:  16,
    paddingVertical: 15,
    alignItems:    "center",
  },
  ctaBtnText: {
    color:      "#fff",
    fontSize:   15,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  ctaSecondary: {
    borderRadius:  14,
    borderWidth:   1,
    paddingVertical: 12,
    alignItems:    "center",
  },
  ctaSecondaryText: { fontSize: 13, fontWeight: "700" },
});
