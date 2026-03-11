import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants";
import { getMyCustomer } from "../../src/services/sanatkat";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    const loadInitials = async () => {
      try {
        const token = await AsyncStorage.getItem("sanatkat_token");
        if (!token) return;
        const customer = await getMyCustomer(token);
        if (customer) {
          const company = customer.billing?.company;
          const source =
            company || `${customer.first_name} ${customer.last_name}`.trim();
          const ini = source
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          setInitials(ini);
        }
      } catch (e) {}
    };
    loadInitials();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Fidrop Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>⚡ Hızlı Üretim</Text>
          </View>
          <Text style={styles.heroTitle}>
            Fidrop ile{"\n"}
            <Text style={styles.heroAccentPurple}>3D Baskı</Text> Siparişi
          </Text>
          <Text style={styles.heroSub}>
            Dosyanı yükle, saniyeler içinde fiyat al.{"\n"}
            Hızlı, kolay, güvenilir.
          </Text>
          <View style={styles.heroFooter}>
            <TouchableOpacity
              style={styles.heroBtnPurple}
              onPress={() => router.push("/(tabs)/print")}
            >
              <Text style={styles.heroBtnText}>Hemen Başla →</Text>
            </TouchableOpacity>
            <View style={styles.heroStats}>
              <Text style={styles.heroStatNum}>500+</Text>
              <Text style={styles.heroStatLabel}>Sipariş</Text>
            </View>
          </View>
          {/* Dekoratif */}
          <View style={styles.dekorPurple1} />
          <View style={styles.dekorPurple2} />
        </View>

        {/* Sanatkat Hero Card */}
        <View style={[styles.heroCard, styles.heroCardGreen]}>
          <View style={[styles.heroBadge, styles.heroBadgeGreen]}>
            <Text style={[styles.heroBadgeText, styles.heroBadgeTextGreen]}>
              🏛️ Sanat Eserleri
            </Text>
          </View>
          <Text style={styles.heroTitle}>
            Sanatkat ile{"\n"}
            <Text style={styles.heroAccentGreen}>Benzersiz</Text> Eserler
          </Text>
          <Text style={styles.heroSub}>
            El yapımı heykeller, biblo ve{"\n"}
            özel sanat eserleri keşfet.
          </Text>
          <View style={styles.heroFooter}>
            <TouchableOpacity
              style={styles.heroBtnGreen}
              onPress={() => router.push("/(tabs)/shop")}
            >
              <Text style={styles.heroBtnText}>Mağazaya Git →</Text>
            </TouchableOpacity>
            <View style={styles.heroStats}>
              <Text style={styles.heroStatNum}>200+</Text>
              <Text style={styles.heroStatLabel}>Ürün</Text>
            </View>
          </View>
          {/* Dekoratif */}
          <View style={styles.dekorGreen1} />
          <View style={styles.dekorGreen2} />
        </View>

        {/* Öne Çıkan Ürünler */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Öne Çıkan Ürünler</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/shop")}>
              <Text style={styles.sectionMore}>Tümü →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productScroll}
          >
            {[
              {
                emoji: "🏛️",
                name: "Apollo Heykeli",
                price: "4.955₺",
                tag: "Çok Satan",
              },
              {
                emoji: "⚙️",
                name: "Prototip Üretim",
                price: "Teklif Al",
                tag: "Popüler",
              },
              {
                emoji: "🐺",
                name: "Anubis Heykeli",
                price: "4.955₺",
                tag: "Yeni",
              },
              { emoji: "🔧", name: "Yedek Parça", price: "Teklif Al", tag: "" },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.productCard}>
                {item.tag ? (
                  <View style={styles.productTag}>
                    <Text style={styles.productTagText}>{item.tag}</Text>
                  </View>
                ) : null}
                <View style={styles.productImg}>
                  <Text style={styles.productEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // Hero Cards
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#1a0a30",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.3)",
    overflow: "hidden",
  },
  heroCardGreen: {
    backgroundColor: "#0a1f12",
    borderColor: "rgba(34,197,94,0.25)",
    marginTop: 12,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(124,58,237,0.2)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.3)",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 14,
  },
  heroBadgeGreen: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderColor: "rgba(34,197,94,0.25)",
  },
  heroBadgeText: { fontSize: 11, color: "#c084fc", fontWeight: "600" },
  heroBadgeTextGreen: { color: "#4ade80" },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 10,
  },
  heroAccentPurple: { color: "#c084fc" },
  heroAccentGreen: { color: "#4ade80" },
  heroSub: {
    fontSize: 13,
    color: Colors.text2,
    lineHeight: 20,
    marginBottom: 20,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroBtnPurple: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  heroBtnGreen: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  heroBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  heroStats: { alignItems: "flex-end" },
  heroStatNum: { fontSize: 20, fontWeight: "800", color: Colors.text },
  heroStatLabel: { fontSize: 11, color: Colors.text2 },

  // Dekoratif
  dekorPurple1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  dekorPurple2: {
    position: "absolute",
    bottom: -20,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(124,58,237,0.05)",
  },
  dekorGreen1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(34,197,94,0.06)",
  },
  dekorGreen2: {
    position: "absolute",
    bottom: -20,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34,197,94,0.04)",
  },

  // Ürünler
  section: { marginTop: 24 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.text },
  sectionMore: { fontSize: 12, color: Colors.accent },
  productScroll: { paddingLeft: 16, paddingRight: 8 },
  productCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },
  productTag: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 1,
    backgroundColor: Colors.accent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  productTagText: { fontSize: 9, fontWeight: "700", color: "#fff" },
  productImg: {
    width: "100%",
    height: 100,
    backgroundColor: "#1e1e2e",
    alignItems: "center",
    justifyContent: "center",
  },
  productEmoji: { fontSize: 40 },
  productInfo: { padding: 10 },
  productName: {
    fontSize: 11,
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 16,
  },
  productPrice: { fontSize: 13, fontWeight: "700", color: Colors.accent },
});
