import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants"; // Merkezi renk kasası

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Saniyeler İçinde\n3D Baskı Siparişi Ver",
    description: "STL dosyanı yükle, profesyonel hesaplama motoruyla anında fiyat al ve üretimi Fimarkt güvencesiyle başlat.",
    icon: "🏭",
    accent: "Akıllı Üretim (Fidrop)",
  },
  {
    id: "2",
    title: "El Emeği Sanattan\nTeknik Ekipmana",
    description: "3D yazıcılardan filamente, ünlü heykellerden bağımsız sanatçıların eserlerine kadar her şeyi tek sepette keşfet.",
    icon: "🛒",
    accent: "Pazaryeri (Sanatkat)",
  },
  {
    id: "3",
    title: "Uzmanlarla Çalış,\nİşini Geleceğe Taşı",
    description: "Özel modelleme için mühendislerden teklif al veya üretim merkezimiz olarak ekosisteme katıl.",
    icon: "🤝",
    accent: "Uzman Ağı (Çözüm Ortakları)",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const markDone = () => AsyncStorage.setItem("fimarkt_onboarding_done", "true");

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      markDone().then(() => router.push("/(auth)/register"));
    }
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Text style={styles.largeIcon}>{item.icon}</Text>
        </View>
        <View style={styles.iconRing} />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✨ {item.accent}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.orb} />
      <View style={[styles.orb, styles.orbBottom]} />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoCube}>
            <View style={styles.cubeTop} />
            <View style={styles.cubeLeft} />
            <View style={styles.cubeRight} />
          </View>
          <Text style={styles.logoText}>fimarkt</Text>
        </View>
      </View>

      <FlatList
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.footer}>
        <View style={styles.paginator}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View 
                key={i} 
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: Colors.accent }]} 
              />
            );
          })}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>
              {currentIndex === SLIDES.length - 1 ? "Hadi Başlayalım" : "Devam Et"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={() => markDone().then(() => router.push("/(auth)/login"))}>
            <Text style={styles.skipBtnText}>Zaten hesabım var</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  orb: {
    position: "absolute", top: -100, right: -100, width: 300, height: 300,
    borderRadius: 150, backgroundColor: Colors.accent + "15",
  },
  orbBottom: { top: undefined, bottom: -150, left: -100, width: 400, height: 400, borderRadius: 200 },
  header: { paddingTop: 60, paddingHorizontal: 30, alignItems: "center" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoCube: { width: 28, height: 28 },
  cubeTop: { position: "absolute", top: 0, width: 20, height: 10, backgroundColor: Colors.accent, transform: [{ skewX: "-20deg" }], borderRadius: 2 },
  cubeLeft: { position: "absolute", top: 8, width: 12, height: 14, backgroundColor: Colors.accent + "CC", borderRadius: 2 },
  cubeRight: { position: "absolute", top: 8, left: 12, width: 12, height: 14, backgroundColor: Colors.accent + "66", borderRadius: 2 },
  logoText: { color: Colors.text, fontSize: 24, fontWeight: "900", letterSpacing: -1 },
  
  slide: { width, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  iconContainer: { marginBottom: 40, alignItems: "center", justifyContent: "center" },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.surface,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border
  },
  iconRing: {
    position: "absolute", width: 150, height: 150, borderRadius: 75,
    borderWidth: 1, borderColor: Colors.accent + "33", borderStyle: "dashed"
  },
  largeIcon: { fontSize: 50 },
  
  textContainer: { alignItems: "center" },
  badge: {
    backgroundColor: Colors.accent + "20", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.accent + "30"
  },
  badgeText: { color: Colors.accent, fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  title: { color: Colors.text, fontSize: 30, fontWeight: "800", textAlign: "center", lineHeight: 38, marginBottom: 16 },
  description: { color: Colors.text2, fontSize: 14, textAlign: "center", lineHeight: 22 },

  footer: { paddingBottom: 60, paddingHorizontal: 30 },
  paginator: { flexDirection: "row", height: 64, justifyContent: "center", alignItems: "center", gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  
  buttonGroup: { gap: 12 },
  primaryBtn: {
    backgroundColor: Colors.accent, paddingVertical: 18, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  primaryBtnText: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  skipBtn: { alignItems: "center", paddingVertical: 10 },
  skipBtnText: { color: Colors.text3, fontSize: 14, fontWeight: "500" },
});