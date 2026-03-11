import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants";
import { useAuth } from "../../src/store/AuthContext";
import { useCart } from "../../src/store/CartContext";
import MegaMenu from "../megamenu";

const KATEGORILER = [
  {
    id: "3d-baski",
    label: "3D Baskı",
    route: "/print-upload",
    params: { service: "3d-baski" },
  },
  {
    id: "prototip",
    label: "Prototip Üretimi",
    route: "/print-quote",
    params: { service: "prototip" },
  },
  {
    id: "yedek-parca",
    label: "Yedek Parça",
    route: "/print-quote",
    params: { service: "yedek-parca" },
  },
  {
    id: "3d-modelleme",
    label: "3D Modelleme",
    route: "/print-quote",
    params: { service: "3d-modelleme" },
  },
  {
    id: "3d-tarama",
    label: "3D Tarama",
    route: "/print-quote",
    params: { service: "3d-tarama" },
  },
  {
    id: "3d-danismanlik",
    label: "3D Danışmanlık",
    route: "/print-quote",
    params: { service: "danismanlik" },
  },
  { id: "ayrac", label: "ayrac" },
  { id: "sanatkat", label: "🏛️ Sanatkat", route: "/(tabs)/shop", params: null },
];

function GlobalHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuth();
  const { totalItems } = useCart();
  const [search, setSearch] = useState("");
  const [activeKategori, setActiveKategori] = useState("hepsi");
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[headerStyles.wrapper, { paddingTop: insets.top }]}>
      <View style={headerStyles.topBar}>
        <TouchableOpacity
          style={headerStyles.logoRow}
          onPress={() => router.push("/(tabs)")}
        >
          <View style={headerStyles.logoCube}>
            <View style={headerStyles.cubeTop} />
            <View style={headerStyles.cubeLeft} />
            <View style={headerStyles.cubeRight} />
          </View>
        </TouchableOpacity>

        <View style={headerStyles.searchBox}>
          <Text style={headerStyles.searchIcon}>🔍</Text>
          <TextInput
            style={headerStyles.searchInput}
            placeholder="Ürün veya hizmet ara..."
            placeholderTextColor={Colors.text3}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={headerStyles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={headerStyles.icons}>
          <TouchableOpacity
            style={headerStyles.iconBtn}
            onPress={() => router.push("/cart")}
          >
            <View>
              <Text style={headerStyles.iconText}>🛒</Text>
              {totalItems > 0 && (
                <View style={headerStyles.cartBadge}>
                  <Text style={headerStyles.cartBadgeText}>
                    {totalItems > 99 ? "99+" : totalItems}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={headerStyles.iconBtn}
            onPress={() => router.push("/notifications")}
          >
            <Text style={headerStyles.iconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={headerStyles.iconBtn}
            onPress={() => router.push("/messages")}
          >
            <Text style={headerStyles.iconText}>🎧</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={headerStyles.kategoriBar}>
        <TouchableOpacity
          style={headerStyles.hamburger}
          onPress={() => setMenuVisible(true)}
        >
          <View style={headerStyles.hamLine} />
          <View style={[headerStyles.hamLine, { width: 14 }]} />
          <View style={headerStyles.hamLine} />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={headerStyles.chipContent}
        >
          {KATEGORILER.map((k) => {
            if (k.id === "ayrac") {
              return <View key="ayrac" style={headerStyles.ayrac} />;
            }
            return (
              <TouchableOpacity
                key={k.id}
                style={[
                  headerStyles.chip,
                  activeKategori === k.id && headerStyles.chipActive,
                  k.id === "sanatkat" && headerStyles.chipSanatkat,
                ]}
                onPress={() => {
                  setActiveKategori(k.id);
                  if (k.route) {
                    router.push({
                      pathname: k.route as any,
                      params: k.params || undefined,
                    });
                  }
                }}
              >
                <Text
                  style={[
                    headerStyles.chipText,
                    activeKategori === k.id && headerStyles.chipTextActive,
                    k.id === "sanatkat" && headerStyles.chipTextSanatkat,
                  ]}
                >
                  {k.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <MegaMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
          height: 56 + insets.bottom,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.text3,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
          header: () => <GlobalHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Mağaza",
          tabBarIcon: ({ color }) => <TabIcon icon="🛍️" color={color} />,
          header: () => <GlobalHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="print"
        options={{
          title: "Üret",
          tabBarIcon: ({ color }) => <TabIcon icon="➕" color={color} />,
          header: () => <GlobalHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Siparişler",
          tabBarIcon: ({ color }) => <TabIcon icon="📦" color={color} />,
          header: () => <GlobalHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Yönetim",
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
          href: currentUser?.isAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  const { Text } = require("react-native");
  return (
    <Text style={{ fontSize: 20, opacity: color === Colors.accent ? 1 : 0.4 }}>
      {icon}
    </Text>
  );
}

const headerStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
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
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text },
  searchClear: { fontSize: 12, color: Colors.text3, padding: 2 },
  icons: { flexDirection: "row", gap: 4 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 16 },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: Colors.accent,
    borderRadius: 99,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: { fontSize: 9, color: "#fff", fontWeight: "800" },
  kategoriBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
  },
  hamburger: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  hamLine: {
    width: 18,
    height: 2,
    backgroundColor: Colors.text2,
    borderRadius: 2,
    marginVertical: 2,
  },
  chipContent: { paddingRight: 12, gap: 8, alignItems: "center" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipSanatkat: {
    backgroundColor: "rgba(124,58,237,0.15)",
    borderColor: "rgba(124,58,237,0.3)",
  },
  chipText: { fontSize: 12, color: Colors.text2, fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  chipTextSanatkat: { color: "#c084fc" },
  ayrac: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
});
