import { useState, useMemo, useCallback } from "react";
import {
  View, Text, Image, Pressable, FlatList,
  TextInput, StyleSheet, StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { FontSizes, LineHeights, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { getSeller }           from "@/lib/mock-data/seller";
import { getProductsBySeller } from "@/lib/mock-data/products";
import AppProductCard          from "@/components/product/AppProductCard";
import type { Product }        from "@/lib/types";

type StoreTab = "urunler" | "hakkinda";

// ── Stat Kutusu ───────────────────────────────────────────────────────────────
function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);
  return (
    <View style={s.statBox}>
      <Text style={[s.statValue, accent && { color: C.accent }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ── Ana Sayfa ─────────────────────────────────────────────────────────────────
export default function SaticiVitrinSayfasi() {
  const { colors: C, isDark } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);

  const { "seller-slug": slug } = useLocalSearchParams<{ "seller-slug": string }>();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const seller   = getSeller(slug ?? "");
  const products = useMemo(() => getProductsBySeller(slug ?? ""), [slug]);

  const [activeTab,  setActiveTab]  = useState<StoreTab>("urunler");
  const [following,  setFollowing]  = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return products;
    const q = searchText.toLowerCase();
    return products.filter(
      (p) => p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    );
  }, [products, searchText]);

  const initials = seller?.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "??";

  // ── Header bileşeni (FlatList ListHeaderComponent) ────────────────────────
  const ListHeader = useCallback(() => (
    <View>
      {/* Kapak Görseli */}
      <View style={s.coverWrap}>
        <Image
          source={{ uri: seller?.coverImage ?? "https://picsum.photos/seed/cover/800/300" }}
          style={s.coverImage}
          resizeMode="cover"
        />
        <View style={s.coverOverlay} />
        {/* Geri Butonu */}
        <Pressable
          onPress={() => router.back()}
          style={[s.backBtn, { top: insets.top + 8 }]}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Avatar — kapakla iç içe */}
      <View style={s.avatarRow}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        {/* Aksiyon butonları */}
        <View style={s.actionRow}>
          <Pressable
            onPress={() => setFollowing((v) => !v)}
            style={[s.followBtn, following && s.followBtnActive]}
          >
            <Text style={[s.followBtnText, following && { color: C.foreground }]}>
              {following ? "✓ Takip" : "Takip Et"}
            </Text>
          </Pressable>
          <Pressable style={s.msgBtn}>
            <Ionicons name="chatbubble-outline" size={16} color={C.foreground} />
          </Pressable>
        </View>
      </View>

      {/* İsim + Onay */}
      <View style={s.nameRow}>
        <Text style={s.storeName}>{seller?.name}</Text>
        {seller?.verified && (
          <View style={s.verifiedBadge}>
            <Text style={s.verifiedText}>✓ Onaylı</Text>
          </View>
        )}
      </View>
      <Text style={s.storeMeta}>{`📍 ${seller?.location} · ${seller?.since}'den beri`}</Text>

      {/* Rozetler */}
      {seller && seller.badges.length > 0 && (
        <View style={s.badgeRow}>
          {seller.badges.map((b) => (
            <View key={b} style={s.badge}>
              <Text style={s.badgeText}>{b}</Text>
            </View>
          ))}
        </View>
      )}

      {/* İstatistikler */}
      <View style={s.statsRow}>
        <StatBox label="Puan"     value={`${seller?.rating.toFixed(1)} ★`} accent />
        <StatBox label="Sipariş"  value={(seller?.orderCount ?? 0).toLocaleString("tr-TR")} />
        <StatBox label="Takipçi"  value={(seller?.followerCount ?? 0).toLocaleString("tr-TR")} />
        <StatBox label="Yanıt %"  value={`%${seller?.responseRate}`} />
      </View>

      {/* Sekmeler */}
      <View style={s.tabRow}>
        {(["urunler", "hakkinda"] as StoreTab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[s.tab, activeTab === tab && s.tabActive]}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === "urunler"
                ? `Ürünler (${products.length})`
                : "Hakkında"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Arama (Ürünler sekmesinde) */}
      {activeTab === "urunler" && (
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={16} color={C.mutedForeground} style={s.searchIcon} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Bu mağazada ara..."
            placeholderTextColor={C.mutedForeground}
            style={s.searchInput}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={C.mutedForeground} />
            </Pressable>
          )}
        </View>
      )}

      {/* Hakkında sekmesi içeriği */}
      {activeTab === "hakkinda" && seller && (
        <View style={s.aboutWrap}>
          <View style={s.aboutCard}>
            <Text style={s.aboutTitle}>Mağaza Hakkında</Text>
            <Text style={s.aboutBio}>{seller.bio}</Text>
          </View>
          <View style={s.aboutCard}>
            {[
              { icon: "📅", label: "Üyelik",    value: seller.since + "'den beri aktif" },
              { icon: "💬", label: "Yanıt",     value: `%${seller.responseRate} yanıt oranı` },
              { icon: "📦", label: "Sipariş",   value: `${seller.orderCount.toLocaleString("tr-TR")} başarılı` },
              { icon: "🏷️", label: "Kategori",  value: seller.categories.join(", ") },
            ].map((row) => (
              <View key={row.label} style={s.infoRow}>
                <Text style={s.infoIcon}>{row.icon}</Text>
                <Text style={s.infoLabel}>{row.label}</Text>
                <Text style={s.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  ), [seller, initials, following, activeTab, searchText, products.length, insets.top, s, C]);

  if (!seller) {
    return (
      <View style={[s.notFound, { paddingTop: insets.top + 16 }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <Pressable onPress={() => router.back()} style={s.backBtnPlain} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </Pressable>
        <Text style={s.notFoundEmoji}>🏪</Text>
        <Text style={s.notFoundTitle}>Mağaza bulunamadı</Text>
        <Text style={s.notFoundSub}>Bu satıcı mevcut değil.</Text>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {activeTab === "urunler" ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={ListHeader}
          renderItem={({ item, index }) => (
            <View style={[
              s.gridItem,
              index % 2 === 0 ? { paddingRight: 4 } : { paddingLeft: 4 },
            ]}>
              <AppProductCard product={item} layout="grid" />
            </View>
          )}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>
                {searchText ? "Aramayla eşleşen ürün yok." : "Bu mağazada henüz ürün yok."}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={s.columnWrapper}
        />
      ) : (
        <FlatList
          data={[]}
          ListHeaderComponent={ListHeader}
          renderItem={null}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    // Cover
    coverWrap:    { height: 160, backgroundColor: C.surface2 },
    coverImage:   { width: "100%", height: "100%" },
    coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
    backBtn: {
      position: "absolute", left: 14,
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center", justifyContent: "center",
    },

    // Avatar
    avatarRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginTop: -28,
      marginBottom: 10,
    },
    avatar: {
      width: 64, height: 64, borderRadius: 16,
      backgroundColor: `${C.accent}25`,
      borderWidth: 3, borderColor: C.background,
      alignItems: "center", justifyContent: "center",
      zIndex: 1, elevation: 2,
    },
    avatarText: { color: C.accent, fontSize: FontSizes.lg, fontWeight: "900" },
    actionRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
    followBtn: {
      paddingHorizontal: 16, paddingVertical: 8,
      borderRadius: 12, backgroundColor: C.accent,
    },
    followBtnActive: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
    followBtnText:   { color: "#fff", fontSize: FontSizes.sm, fontWeight: "700" },
    msgBtn: {
      width: 36, height: 36, borderRadius: 12,
      backgroundColor: C.surface2,
      borderWidth: 1, borderColor: C.border,
      alignItems: "center", justifyContent: "center",
    },

    // İsim
    nameRow:     { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16 },
    storeName:   { fontSize: FontSizes.xl, fontWeight: "900", color: C.foreground },
    verifiedBadge: {
      backgroundColor: C.accent, borderRadius: 20,
      paddingHorizontal: 7, paddingVertical: 2,
    },
    verifiedText: { color: "#fff", fontSize: 10, fontWeight: "800" },
    storeMeta:    { fontSize: FontSizes.xs, color: C.mutedForeground, paddingHorizontal: 16, marginTop: 3 },

    // Rozetler
    badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: 16, marginTop: 8 },
    badge:    { backgroundColor: `${C.accent}18`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText:{ color: C.accent, fontSize: 11, fontWeight: "700" },

    // İstatistikler
    statsRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      marginTop: 12,
    },
    statBox: {
      flex: 1, backgroundColor: C.surface,
      borderRadius: 12, borderWidth: 1, borderColor: C.border,
      padding: 10, alignItems: "center", gap: 2,
    },
    statValue: { fontSize: FontSizes.sm, fontWeight: "900", color: C.foreground },
    statLabel: { fontSize: 9, color: C.mutedForeground },

    // Sekmeler
    tabRow: {
      flexDirection: "row",
      gap: 6,
      paddingHorizontal: 16,
      marginTop: 16,
      marginBottom: 4,
    },
    tab: {
      paddingHorizontal: 16, paddingVertical: 8,
      borderRadius: 20, borderWidth: 1, borderColor: C.border,
      backgroundColor: C.surface2,
    },
    tabActive:     { backgroundColor: C.accent, borderColor: C.accent },
    tabText:       { fontSize: FontSizes.sm, fontWeight: "600", color: C.mutedForeground },
    tabTextActive: { color: "#fff", fontWeight: "700" },

    // Arama
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 4,
      backgroundColor: C.surface,
      borderWidth: 1, borderColor: C.border,
      borderRadius: 14,
      paddingHorizontal: 12, paddingVertical: 10,
      gap: 8,
    },
    searchIcon:  {},
    searchInput: { flex: 1, fontSize: FontSizes.sm, color: C.foreground },

    // Grid
    columnWrapper: { paddingHorizontal: 16, marginTop: 8 },
    gridItem:      { flex: 1 },

    // Boş
    emptyWrap: { padding: 32, alignItems: "center" },
    emptyText: { color: C.mutedForeground, fontSize: FontSizes.sm, textAlign: "center" },

    // Hakkında
    aboutWrap: { padding: 16, gap: 12 },
    aboutCard: {
      backgroundColor: C.surface, borderRadius: 16,
      borderWidth: 1, borderColor: C.border, padding: 16, gap: 10,
    },
    aboutTitle: { fontSize: FontSizes.md, fontWeight: "800", color: C.foreground },
    aboutBio:   { fontSize: FontSizes.sm, color: C.mutedForeground, lineHeight: LineHeights.md },
    infoRow:    { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    infoIcon:   { width: 20, fontSize: FontSizes.sm },
    infoLabel:  { width: 60, fontSize: FontSizes.xs, color: C.mutedForeground, fontWeight: "600" },
    infoValue:  { flex: 1, fontSize: FontSizes.xs, color: C.foreground, fontWeight: "600" },

    // Not found
    notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
    backBtnPlain: { position: "absolute", top: 16, left: 16 },
    notFoundEmoji: { fontSize: 56 },
    notFoundTitle: { fontSize: FontSizes["2xl"], fontWeight: "900", color: C.foreground },
    notFoundSub:   { fontSize: FontSizes.sm, color: C.mutedForeground },
  });
}
