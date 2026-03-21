import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Dimensions,
} from "react-native";
import { useRouter, Link } from "expo-router";
import Animated, {
  FadeIn, useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";

const { width } = Dimensions.get("window");
const C = Colors.dark;
const REDIRECT_AFTER = 10;

export default function NotFoundScreen() {
  const router = useRouter();
  const [query,     setQuery]     = useState("");
  const [countdown, setCountdown] = useState(REDIRECT_AFTER);

  // 10 sn sonra ana sayfaya yönlendir
  useEffect(() => {
    if (countdown <= 0) { router.replace("/"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  // Float animasyonu (ikon)
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1500 }),
        withTiming(0,   { duration: 1500 }),
      ),
      -1,
      false,
    );
  }, []);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  const handleSearch = () => {
    if (query.trim()) router.push(`/(tabs)/shop?q=${encodeURIComponent(query.trim())}` as any);
  };

  return (
    <View style={s.container}>

      {/* Glow */}
      <View style={s.glow} />

      <Animated.View entering={FadeIn.duration(600)} style={s.content}>

        {/* Yüzen ikon */}
        <Animated.Text style={[s.icon, floatStyle]}>🖨️</Animated.Text>

        {/* Kod */}
        <Text style={s.errorCode}>404</Text>

        <Text style={s.title}>Sayfa Tablaya Yapışmadı</Text>
        <Text style={s.subtitle}>
          Aradığın model bulunamadı. Arama yaparak devam edebilirsin.
        </Text>

        {/* Arama */}
        <View style={s.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            placeholder="Ürün veya hizmet ara..."
            placeholderTextColor={C.mutedForeground}
            returnKeyType="search"
            style={s.searchInput}
          />
          <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
            <Text style={s.searchBtnText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Butonlar */}
        <View style={s.btns}>
          <TouchableOpacity style={s.btnPrimary} onPress={() => router.replace("/")}>
            <Text style={s.btnPrimaryText}>🏠 Ana Sayfa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => router.push("/(tabs)/print")}>
            <Text style={s.btnSecondaryText}>🚀 Teklif Al</Text>
          </TouchableOpacity>
        </View>

        {/* Geri sayım */}
        <View style={s.countdownRow}>
          <View style={s.countdownCircle}>
            <Text style={s.countdownNum}>{countdown}</Text>
          </View>
          <Text style={s.countdownText}>saniye içinde otomatik yönlendiriliyorsunuz</Text>
        </View>

      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center", padding: 24 },
  glow:            { position: "absolute", top: "20%", width: 300, height: 300, borderRadius: 150, backgroundColor: C.accent, opacity: 0.04 },
  content:         { maxWidth: 380, width: "100%", alignItems: "center" },
  icon:            { fontSize: 80, marginBottom: 8 },
  errorCode:       { fontSize: 64, fontWeight: "900", color: `${C.accent}30`, marginBottom: 4 },
  title:           { fontSize: 22, fontWeight: "900", color: C.foreground, marginBottom: 8, textAlign: "center" },
  subtitle:        { fontSize: 13, color: C.mutedForeground, lineHeight: 20, textAlign: "center", marginBottom: 24, maxWidth: 300 },
  searchRow:       { flexDirection: "row", gap: 8, marginBottom: 16, width: "100%" },
  searchInput:     { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: C.foreground },
  searchBtn:       { width: 48, height: 48, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  searchBtnText:   { fontSize: 20 },
  btns:            { flexDirection: "row", gap: 10, marginBottom: 28 },
  btnPrimary:      { flex: 1, backgroundColor: C.accent, paddingVertical: 13, borderRadius: 16, alignItems: "center" },
  btnPrimaryText:  { fontSize: 13, fontWeight: "700", color: "#fff" },
  btnSecondary:    { flex: 1, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, paddingVertical: 13, borderRadius: 16, alignItems: "center" },
  btnSecondaryText:{ fontSize: 13, fontWeight: "600", color: C.foreground },
  countdownRow:    { flexDirection: "row", alignItems: "center", gap: 8 },
  countdownCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: `${C.accent}18`, borderWidth: 1.5, borderColor: C.accent, alignItems: "center", justifyContent: "center" },
  countdownNum:    { fontSize: 11, fontWeight: "900", color: C.accent },
  countdownText:   { fontSize: 11, color: C.mutedForeground, flex: 1 },
});
