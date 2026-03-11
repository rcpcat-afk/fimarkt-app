import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../components/AuthComponents";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Arka plan dekoratif elemanlar */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.grid} />

      {/* Geometrik dekoratif şekiller */}
      <View style={styles.decorTopRight}>
        <View style={styles.hexagon} />
        <View style={[styles.hexagon, styles.hexSmall]} />
      </View>
      <View style={styles.decorBottomLeft}>
        <View style={[styles.ring, styles.ring1]} />
        <View style={[styles.ring, styles.ring2]} />
      </View>

      {/* Logo */}
      <Animated.View style={[styles.logoArea, { opacity: logoAnim }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoCube}>
            <View style={styles.cubeTop} />
            <View style={styles.cubeLeft} />
            <View style={styles.cubeRight} />
          </View>
          <Text style={styles.logo}>fimarkt</Text>
        </View>
        <View style={styles.logoUnderline} />
      </Animated.View>

      {/* Orta içerik */}
      <Animated.View
        style={[
          styles.middle,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🇹🇷 Türkiye'nin Üretim Platformu</Text>
        </View>
        <Text style={styles.headline}>
          Fikirden üretime{"\n"}
          <Text style={styles.headlineAccent}>uzanan yol.</Text>
        </Text>
        <Text style={styles.desc}>
          3D baskı, sanat eserleri ve özel üretim.{"\n"}
          Tek platformda, saniyeler içinde.
        </Text>

        {/* Özellik ikonları */}
        <View style={styles.features}>
          {[
            { icon: "⬡", label: "3D Baskı" },
            { icon: "◈", label: "Sanat & Biblo" },
            { icon: "◉", label: "Hızlı Teslimat" },
          ].map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Butonlar */}
      <Animated.View style={[styles.btns, { opacity: btnAnim }]}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate("Register")}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Hesap Oluştur</Text>
          <Text style={styles.btnArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate("Login")}
          activeOpacity={0.85}
        >
          <Text style={styles.btnOutlineText}>Giriş Yap</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guestBtn}>
          <Text style={styles.guestText}>Misafir olarak devam et</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 44,
    overflow: "hidden",
  },

  // Arka plan efektleri
  orb1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,107,43,0.08)",
  },
  orb2: {
    position: "absolute",
    bottom: 100,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,107,43,0.05)",
  },
  grid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundColor: "transparent",
    borderWidth: 0,
  },

  // Dekoratif
  decorTopRight: {
    position: "absolute",
    top: 60,
    right: 20,
    gap: 8,
  },
  decorBottomLeft: {
    position: "absolute",
    bottom: 160,
    left: 20,
  },
  hexagon: {
    width: 20,
    height: 20,
    backgroundColor: "rgba(255,107,43,0.2)",
    borderRadius: 4,
    transform: [{ rotate: "45deg" }],
  },
  hexSmall: {
    width: 12,
    height: 12,
    marginLeft: 16,
    backgroundColor: "rgba(255,107,43,0.12)",
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,107,43,0.15)",
  },
  ring1: { width: 60, height: 60, top: 0, left: 0 },
  ring2: { width: 40, height: 40, top: 10, left: 10 },

  // Logo
  logoArea: { marginBottom: 48 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoCube: { width: 32, height: 32, position: "relative" },
  cubeTop: {
    position: "absolute",
    top: 0,
    left: 4,
    width: 24,
    height: 12,
    backgroundColor: Colors.accent,
    borderRadius: 3,
    transform: [{ skewX: "-20deg" }],
  },
  cubeLeft: {
    position: "absolute",
    top: 10,
    left: 0,
    width: 14,
    height: 16,
    backgroundColor: "rgba(255,107,43,0.6)",
    borderRadius: 2,
  },
  cubeRight: {
    position: "absolute",
    top: 10,
    left: 14,
    width: 14,
    height: 16,
    backgroundColor: "rgba(255,107,43,0.35)",
    borderRadius: 2,
  },
  logo: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -2,
    color: Colors.text,
  },
  logoUnderline: {
    marginTop: 6,
    width: 40,
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    marginLeft: 44,
  },

  // Orta
  middle: { flex: 1, justifyContent: "center" },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,107,43,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,107,43,0.2)",
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
  },
  badgeText: { fontSize: 11, color: Colors.accent, fontWeight: "600" },
  headline: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: 14,
  },
  headlineAccent: { color: Colors.accent },
  desc: {
    fontSize: 14,
    color: Colors.text2,
    lineHeight: 22,
    marginBottom: 32,
  },
  features: {
    flexDirection: "row",
    gap: 12,
  },
  featureItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  featureIcon: { fontSize: 20, color: Colors.accent },
  featureLabel: {
    fontSize: 10,
    color: Colors.text2,
    fontWeight: "600",
    textAlign: "center",
  },

  // Butonlar
  btns: { gap: 10 },
  btnPrimary: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnPrimaryText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  btnArrow: { fontSize: 16, color: "#fff" },
  btnOutline: {
    borderRadius: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutlineText: { fontSize: 15, fontWeight: "600", color: Colors.text },
  guestBtn: { alignItems: "center", paddingVertical: 8 },
  guestText: { fontSize: 13, color: Colors.text3 },
});
