// ─── Ödeme Başarılı — App ────────────────────────────────────────────────────
// Reanimated ile büyüyerek gelen yeşil checkmark animasyonu.
// Android donanımsal geri tuşu → Ana sayfaya zorla (ödeme formuna dönemesin).

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Clipboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { type ThemeColors } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

function fmt(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildC(colors: ThemeColors) {
  return { ...colors, bg: colors.background, text: colors.foreground, text2: colors.mutedForeground, text3: colors.subtleForeground };
}
type AliasedColors = ReturnType<typeof buildC>;

function createStyles(C: AliasedColors) {
  return StyleSheet.create({
    container:         { flex: 1, backgroundColor: C.bg },
    scroll:            { flexGrow: 1, alignItems: "center", padding: 24, paddingTop: 60 },

    // Checkmark
    checkmarkWrapper:  { width: 120, height: 120, alignItems: "center", justifyContent: "center", marginBottom: 28 },
    checkmarkCircle:   { width: 108, height: 108, borderRadius: 54, backgroundColor: "rgba(34,197,94,0.12)", borderWidth: 3, borderColor: "#22c55e", alignItems: "center", justifyContent: "center" },
    checkmarkTick:     { fontSize: 50, color: "#22c55e", fontWeight: "900", lineHeight: 60 },
    checkmarkHalo:     { position: "absolute", width: 120, height: 120, borderRadius: 60, borderWidth: 1.5, borderColor: "rgba(34,197,94,0.2)" },

    // Metinler
    title:             { fontSize: 24, fontWeight: "900", color: C.text, textAlign: "center", marginBottom: 8 },
    subtitle:          { fontSize: 14, color: C.text2, textAlign: "center", lineHeight: 22, marginBottom: 24, maxWidth: 280 },

    // Sipariş no
    orderNoCard:       { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12 },
    orderNoLabel:      { fontSize: 9, fontWeight: "800", color: C.text3, letterSpacing: 1.5, marginBottom: 4 },
    orderNoValue:      { fontSize: 16, fontWeight: "900", color: C.text, fontVariant: ["tabular-nums"], letterSpacing: 1 },
    copyBtn:           { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
    copyBtnDone:       { backgroundColor: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.3)" },
    copyBtnText:       { fontSize: 11, fontWeight: "700", color: C.text2 },
    copyBtnTextDone:   { color: "#22c55e" },

    // Tutar
    totalRow:          { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20 },
    totalLabel:        { fontSize: 13, color: C.text2 },
    totalValue:        { fontSize: 18, fontWeight: "900", color: C.accent },

    // Dijital not
    digitalNote:       { width: "100%", backgroundColor: "rgba(59,130,246,0.06)", borderWidth: 1, borderColor: "rgba(59,130,246,0.15)", borderRadius: 14, padding: 14, marginBottom: 16 },
    digitalNoteText:   { fontSize: 12, fontWeight: "600", color: "#60a5fa", textAlign: "center" },

    // CTA'lar
    ctaGroup:          { width: "100%", gap: 12, marginBottom: 20 },
    primaryBtn:        { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
    primaryBtnText:    { fontSize: 15, fontWeight: "900", color: "#fff" },
    digitalBtn:        { backgroundColor: "rgba(59,130,246,0.08)", borderWidth: 1, borderColor: "rgba(59,130,246,0.2)", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
    digitalBtnText:    { fontSize: 14, fontWeight: "700", color: "#60a5fa" },
    secondaryBtn:      { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
    secondaryBtnText:  { fontSize: 14, fontWeight: "700", color: C.text },

    supportNote:       { fontSize: 11, color: C.text3, textAlign: "center" },
  });
}

// ── Animated Checkmark ────────────────────────────────────────────────────────
function AnimatedCheckmark() {
  const { colors } = useTheme();
  const C = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

  const scale        = useSharedValue(0);
  const opacity      = useSharedValue(0);
  const tickOpacity  = useSharedValue(0);

  useEffect(() => {
    scale.value       = withSpring(1, { damping: 12, stiffness: 180 });
    opacity.value     = withTiming(1, { duration: 300 });
    tickOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const tickStyle = useAnimatedStyle(() => ({
    opacity: tickOpacity.value,
  }));

  return (
    <View style={styles.checkmarkWrapper}>
      <Animated.View style={[styles.checkmarkCircle, circleStyle]}>
        <Animated.Text style={[styles.checkmarkTick, tickStyle]}>✓</Animated.Text>
      </Animated.View>
      <Animated.View style={styles.checkmarkHalo} entering={FadeIn.delay(200).duration(400)} />
    </View>
  );
}

// ── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function BasariliScreen() {
  const { colors, isDark } = useTheme();
  const C = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

  const router = useRouter();
  const { no, digital, total } = useLocalSearchParams<{
    no?: string; digital?: string; total?: string;
  }>();

  const orderNo   = no      ?? "FMRKT-?????";
  const isDigital = digital === "true";
  const totalAmt  = total ? parseFloat(total) : 0;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/(tabs)");
      return true;
    });
    return () => sub.remove();
  }, [router]);

  function copyOrderNo() {
    Clipboard.setString(orderNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AnimatedCheckmark />

        <Animated.Text style={styles.title} entering={FadeInDown.delay(600).duration(400)}>
          Siparişiniz Alındı! 🎉
        </Animated.Text>

        <Animated.Text style={styles.subtitle} entering={FadeInDown.delay(700).duration(400)}>
          {isDigital
            ? "Dijital dosyalarınız hesabınıza eklendi."
            : "Siparişiniz hazırlanıyor. Kargo bilgisi e-postanıza gönderilecek."}
        </Animated.Text>

        <Animated.View style={styles.orderNoCard} entering={FadeInDown.delay(800).duration(400)}>
          <View>
            <Text style={styles.orderNoLabel}>SİPARİŞ NO</Text>
            <Text style={styles.orderNoValue}>{orderNo}</Text>
          </View>
          <TouchableOpacity onPress={copyOrderNo} style={[styles.copyBtn, copied && styles.copyBtnDone]}>
            <Text style={[styles.copyBtnText, copied && styles.copyBtnTextDone]}>
              {copied ? "✓ Kopyalandı" : "Kopyala"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {totalAmt > 0 && (
          <Animated.View style={styles.totalRow} entering={FadeInDown.delay(900).duration(400)}>
            <Text style={styles.totalLabel}>Toplam Ödendi</Text>
            <Text style={styles.totalValue}>{fmt(totalAmt)}₺</Text>
          </Animated.View>
        )}

        {isDigital && (
          <Animated.View style={styles.digitalNote} entering={FadeInDown.delay(950).duration(400)}>
            <Text style={styles.digitalNoteText}>
              🎨 Hesabım → Kütüphanem bölümünden dosyalarınıza ulaşabilirsiniz.
            </Text>
          </Animated.View>
        )}

        <Animated.View style={styles.ctaGroup} entering={FadeInDown.delay(1000).duration(400)}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace("/(tabs)/orders")}>
            <Text style={styles.primaryBtnText}>📦 Siparişimi Takip Et</Text>
          </TouchableOpacity>

          {isDigital && (
            <TouchableOpacity style={styles.digitalBtn}>
              <Text style={styles.digitalBtnText}>🎨 Kütüphanemden İndir</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.secondaryBtnText}>Alışverişe Devam Et</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text style={styles.supportNote} entering={FadeInDown.delay(1100).duration(400)}>
          Sorun yaşarsan destek hattımıza yazabilirsin.
        </Animated.Text>
      </ScrollView>
    </View>
  );
}
