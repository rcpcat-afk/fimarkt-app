import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors as ThemeColors } from "../constants/theme";
const Colors = ThemeColors.dark;

const { width, height } = Dimensions.get("window");

const MENU = [
  {
    id: "3d",
    label: "3D Hizmetler",
    icon: "🖨️",
    items: [
      {
        id: "baski",
        icon: "🖨️",
        label: "3D Baskı",
        desc: "Anında fiyat al",
        color: Colors.accent,
        route: "/print-upload",
        params: { service: "3d-baski" },
      },
      {
        id: "prototip",
        icon: "🔬",
        label: "Prototip Üretimi",
        desc: "Teklif al",
        color: "#f59e0b",
        route: "/print-quote",
        params: { service: "prototip" },
      },
      {
        id: "yedek",
        icon: "⚙️",
        label: "Yedek Parça",
        desc: "Teklif al",
        color: "#ec4899",
        route: "/print-quote",
        params: { service: "yedek-parca" },
      },
      {
        id: "modelleme",
        icon: "🧊",
        label: "3D Modelleme",
        desc: "Teklif al",
        color: "#6366f1",
        route: "/print-quote",
        params: { service: "3d-modelleme" },
      },
      {
        id: "tarama",
        icon: "📡",
        label: "3D Tarama",
        desc: "Teklif al",
        color: "#0ea5e9",
        route: "/print-quote",
        params: { service: "3d-tarama" },
      },
      {
        id: "danismanlik",
        icon: "💡",
        label: "Danışmanlık",
        desc: "Ücretsiz",
        color: "#22c55e",
        route: "/print-quote",
        params: { service: "danismanlik" },
      },
    ],
  },
  {
    id: "sanatkat",
    label: "Sanatkat",
    icon: "🏛️",
    items: [
      {
        id: "magaza",
        icon: "🛍️",
        label: "Tüm Ürünler",
        desc: "Mağazaya git",
        color: "#c084fc",
        route: "/(tabs)/shop",
        params: null,
      },
      {
        id: "heykel",
        icon: "🗿",
        label: "Heykeller",
        desc: "Keşfet",
        color: "#c084fc",
        route: "/(tabs)/shop",
        params: null,
      },
      {
        id: "biblo",
        icon: "🎨",
        label: "Biblolar",
        desc: "Keşfet",
        color: "#c084fc",
        route: "/(tabs)/shop",
        params: null,
      },
      {
        id: "takilar",
        icon: "💍",
        label: "Takılar",
        desc: "Keşfet",
        color: "#c084fc",
        route: "/(tabs)/shop",
        params: null,
      },
    ],
  },
  {
    id: "hesabim",
    label: "Hesabım",
    icon: "👤",
    items: [
      {
        id: "profil",
        icon: "👤",
        label: "Profil",
        desc: "Bilgilerini gör",
        color: Colors.accent,
        route: "/(tabs)/profile",
        params: null,
      },
      {
        id: "siparisler",
        icon: "📦",
        label: "Siparişlerim",
        desc: "Takip et",
        color: "#0ea5e9",
        route: "/(tabs)/orders",
        params: null,
      },
      {
        id: "favoriler",
        icon: "❤️",
        label: "Favorilerim",
        desc: "Kayıtlı ürünler",
        color: "#ef4444",
        route: "/favorites",
        params: null,
      },
      {
        id: "adresler",
        icon: "📍",
        label: "Adreslerim",
        desc: "Teslimat adresleri",
        color: "#22c55e",
        route: "/addresses",
        params: null,
      },
    ],
  },
  {
    id: "hakkimizda",
    label: "Hakkımızda",
    icon: "ℹ️",
    items: [
      {
        id: "fidrop",
        icon: "🖨️",
        label: "Fidrop Nedir?",
        desc: "3D üretim platformu",
        color: Colors.accent,
        route: "/(tabs)/print",
        params: null,
      },
      {
        id: "sanatkat_hk",
        icon: "🏛️",
        label: "Sanatkat Nedir?",
        desc: "Sanat & biblo mağazası",
        color: "#c084fc",
        route: "/(tabs)/shop",
        params: null,
      },
      {
        id: "iletisim",
        icon: "🎧",
        label: "İletişim & Destek",
        desc: "Bize ulaşın",
        color: "#22c55e",
        route: "/messages",
        params: null,
      },
      {
        id: "bildirimler",
        icon: "🔔",
        label: "Bildirimler",
        desc: "Güncellemeler",
        color: "#f59e0b",
        route: "/notifications",
        params: null,
      },
    ],
  },
];

interface MegaMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function MegaMenu({ visible, onClose }: MegaMenuProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState("3d");

  const activeMenu = MENU.find((m) => m.id === activeCategory)!;

  const handleNavigate = (route: string, params: any) => {
    onClose();
    setTimeout(() => {
      router.push({ pathname: route as any, params: params || undefined });
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={[styles.menuContainer, { paddingTop: insets.top }]}>
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoCube}>
                <View style={styles.cubeTop} />
                <View style={styles.cubeLeft} />
                <View style={styles.cubeRight} />
              </View>
              <Text style={styles.logoText}>fimarkt</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* İçerik */}
          <View style={styles.content}>
            {/* Sol şerit */}
            <View style={styles.leftPanel}>
              {MENU.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.leftItem,
                    activeCategory === m.id && styles.leftItemActive,
                  ]}
                  onPress={() => setActiveCategory(m.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.leftIcon}>{m.icon}</Text>
                  <Text
                    style={[
                      styles.leftLabel,
                      activeCategory === m.id && styles.leftLabelActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                  {activeCategory === m.id && (
                    <View style={styles.leftIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Sağ alan */}
            <ScrollView
              style={styles.rightPanel}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.rightTitle}>{activeMenu.label}</Text>
              {activeMenu.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.rightItem}
                  onPress={() => handleNavigate(item.route, item.params)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.rightIconWrap,
                      { backgroundColor: item.color + "22" },
                    ]}
                  >
                    <Text style={styles.rightIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.rightInfo}>
                    <Text style={styles.rightLabel}>{item.label}</Text>
                    <Text style={styles.rightDesc}>{item.desc}</Text>
                  </View>
                  <Text style={[styles.rightArrow, { color: item.color }]}>
                    ›
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  menuContainer: {
    width: width * 0.88,
    height,
    backgroundColor: Colors.background,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoCube: { width: 28, height: 28, position: "relative" },
  cubeTop: {
    position: "absolute",
    top: 0,
    left: 3,
    width: 22,
    height: 11,
    backgroundColor: Colors.accent,
    borderRadius: 3,
    transform: [{ skewX: "-20deg" }],
  },
  cubeLeft: {
    position: "absolute",
    top: 9,
    left: 0,
    width: 12,
    height: 14,
    backgroundColor: "rgba(255,107,43,0.6)",
    borderRadius: 2,
  },
  cubeRight: {
    position: "absolute",
    top: 9,
    left: 12,
    width: 12,
    height: 14,
    backgroundColor: "rgba(255,107,43,0.35)",
    borderRadius: 2,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.foreground,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: { fontSize: 14, color: Colors.mutedForeground },
  content: { flex: 1, flexDirection: "row" },

  // Sol panel
  leftPanel: {
    width: 110,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingTop: 8,
  },
  leftItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 6,
    position: "relative",
  },
  leftItemActive: { backgroundColor: Colors.background },
  leftIcon: { fontSize: 22 },
  leftLabel: {
    fontSize: 10,
    color: Colors.subtleForeground,
    textAlign: "center",
    fontWeight: "600",
  },
  leftLabelActive: { color: Colors.accent },
  leftIndicator: {
    position: "absolute",
    right: 0,
    top: "25%",
    width: 3,
    height: "50%",
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },

  // Sağ panel
  rightPanel: { flex: 1, padding: 16 },
  rightTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.subtleForeground,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  rightItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  rightIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rightIcon: { fontSize: 18 },
  rightInfo: { flex: 1 },
  rightLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.foreground,
    marginBottom: 2,
  },
  rightDesc: { fontSize: 11, color: Colors.mutedForeground },
  rightArrow: { fontSize: 20, fontWeight: "700" },
});
