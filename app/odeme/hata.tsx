// ─── Ödeme Hata — App ─────────────────────────────────────────────────────────
// "Panik Yok" konsepti — turuncu ton, korkutucu değil.
// Iyzico hata kodu tablosu. BackHandler → sepete zorla.

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  BackHandler,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "../../constants/theme";

const C = {
  ...Colors.dark,
  bg:    Colors.dark.background,
  text:  Colors.dark.foreground,
  text2: Colors.dark.mutedForeground,
  text3: Colors.dark.subtleForeground,
};

// ── Iyzico Hata Kodu Tablosu ──────────────────────────────────────────────────
const IYZICO_ERRORS: Record<string, { title: string; desc: string; icon: string }> = {
  "1":  { title: "Genel Hata",             desc: "Beklenmedik bir sorun oluştu. Lütfen tekrar deneyin.",                   icon: "⚠️" },
  "2":  { title: "Kart Limiti Yetersiz",   desc: "Kartınızda yeterli limit bulunmuyor. Farklı bir kart deneyebilirsiniz.", icon: "💳" },
  "5":  { title: "İşlem Reddedildi",       desc: "Bankanız bu işlemi reddetti. Bankanızı arayarak bilgi alabilirsiniz.",   icon: "🚫" },
  "6":  { title: "Geçersiz Kart Bilgisi",  desc: "Kart bilgileriniz hatalı. Lütfen kontrol edip tekrar deneyin.",         icon: "❌" },
  "12": { title: "Geçersiz İşlem",         desc: "Bu işlem türü bu kart için geçerli değil.",                              icon: "🔒" },
  "41": { title: "Kart Kullanıma Kapalı", desc: "Bu kart aktif değil. Lütfen bankanızla iletişime geçin.",                icon: "🔐" },
  "51": { title: "Yetersiz Bakiye",        desc: "Kartınızda bu işlem için yeterli bakiye yok.",                           icon: "💰" },
  "54": { title: "Kartın Süresi Dolmuş",  desc: "Kartınızın son kullanma tarihi geçmiş. Yeni kartınızı kullanın.",        icon: "📅" },
  "57": { title: "İzin Verilmeyen İşlem", desc: "Bu işlem türü kartınız için izinli değil.",                              icon: "🛑" },
  "61": { title: "Günlük Limit Aşıldı",   desc: "Günlük işlem limitinizi aştınız. Yarın tekrar deneyebilirsiniz.",       icon: "📊" },
};

const DEFAULT_ERROR = {
  title: "Ödeme Tamamlanamadı",
  desc:  "İşleminiz sırasında bir sorun oluştu. Sepetiniz korundu, tekrar deneyebilirsiniz.",
  icon:  "😅",
};

const TIPS = [
  "Farklı bir kart ile tekrar deneyebilirsin",
  "Kart limitini veya bakiyeni kontrol edebilirsin",
  "Bankanı arayarak işlem onayı isteyebilirsin",
  "Sorun devam ederse destek hattımıza yazabilirsin",
];

// ── Animated Icon ──────────────────────────────────────────────────────────────
function ErrorIcon({ icon }: { icon: string }) {
  const scale   = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value   = withSpring(1, { damping: 10, stiffness: 160 });
    opacity.value = withTiming(1, { duration: 250 });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.iconCircle, style]}>
      <Text style={styles.iconEmoji}>{icon}</Text>
    </Animated.View>
  );
}

// ── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function HataScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const err = IYZICO_ERRORS[code ?? ""] ?? DEFAULT_ERROR;

  // ── Android Donanımsal Geri Tuşu — sepete zorla ───────────────────────────
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/(tabs)/cart" as never);
      return true;
    });
    return () => sub.remove();
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated hata ikonu */}
        <ErrorIcon icon={err.icon} />

        {/* "Panik Yok" rozeti */}
        <Animated.View
          style={styles.panicBadge}
          entering={FadeInDown.delay(300).duration(350)}
        >
          <Text style={styles.panicBadgeText}>😌  Panik Yok — Sepetiniz Güvende</Text>
        </Animated.View>

        <Animated.Text
          style={styles.title}
          entering={FadeInDown.delay(400).duration(350)}
        >
          {err.title}
        </Animated.Text>

        <Animated.Text
          style={styles.desc}
          entering={FadeInDown.delay(480).duration(350)}
        >
          {err.desc}
        </Animated.Text>

        {code && (
          <Animated.Text
            style={styles.errorCode}
            entering={FadeInDown.delay(540).duration(350)}
          >
            Hata Kodu: {code}
          </Animated.Text>
        )}

        {/* Ne yapabilirsin? */}
        <Animated.View
          style={styles.tipsBox}
          entering={FadeInDown.delay(600).duration(350)}
        >
          <Text style={styles.tipsTitle}>Ne yapabilirsin?</Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipArrow}>→</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA'lar */}
        <Animated.View
          style={styles.ctaGroup}
          entering={FadeInDown.delay(750).duration(350)}
        >
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/odeme")}
          >
            <Text style={styles.primaryBtnText}>🔄 Tekrar Dene</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace("/(tabs)/cart" as never)}
          >
            <Text style={styles.secondaryBtnText}>🛒 Sepetime Dön</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/destek" as never)}>
            <Text style={styles.supportLink}>Yardım almak için destek hattımıza yaz →</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: C.bg },
  scroll:          { flexGrow: 1, alignItems: "center", padding: 24, paddingTop: 60 },

  // Icon
  iconCircle:      { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(249,115,22,0.1)", borderWidth: 2, borderColor: "rgba(249,115,22,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  iconEmoji:       { fontSize: 44 },

  // Panik Yok rozeti
  panicBadge:      { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(249,115,22,0.1)", borderWidth: 1, borderColor: "rgba(249,115,22,0.2)", borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16 },
  panicBadgeText:  { fontSize: 12, fontWeight: "700", color: "#fb923c" },

  // Metinler
  title:           { fontSize: 22, fontWeight: "900", color: C.text, textAlign: "center", marginBottom: 8 },
  desc:            { fontSize: 14, color: C.text2, textAlign: "center", lineHeight: 22, maxWidth: 300, marginBottom: 4 },
  errorCode:       { fontSize: 10, fontWeight: "600", color: C.text3, fontVariant: ["tabular-nums"], marginBottom: 24 },

  // İpuçları
  tipsBox:         { width: "100%", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 24 },
  tipsTitle:       { fontSize: 9, fontWeight: "800", color: C.text3, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 },
  tipRow:          { flexDirection: "row", gap: 10, marginBottom: 8, alignItems: "flex-start" },
  tipArrow:        { fontSize: 13, color: C.accent, fontWeight: "700", marginTop: 1 },
  tipText:         { flex: 1, fontSize: 13, color: C.text2, lineHeight: 20 },

  // CTA'lar
  ctaGroup:        { width: "100%", gap: 12, alignItems: "center" },
  primaryBtn:      { width: "100%", backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  primaryBtnText:  { fontSize: 15, fontWeight: "900", color: "#fff" },
  secondaryBtn:    { width: "100%", backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  secondaryBtnText:{ fontSize: 14, fontWeight: "700", color: C.text },
  supportLink:     { fontSize: 12, color: C.text3, marginTop: 4 },
});
