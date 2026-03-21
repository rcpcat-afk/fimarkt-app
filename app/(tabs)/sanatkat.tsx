import { useState, useMemo } from "react";
import {
  View, Text, ScrollView, Pressable,
  TextInput, StyleSheet, StatusBar, Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, FontSizes } from "@/constants/theme";
import { getAllArtworks, type ArtworkCategory } from "@/lib/mock-data/artworks";
import { getAllArtists } from "@/lib/mock-data/artists";

const C = Colors.dark;

type FilterCategory = ArtworkCategory | "tumumu";

const CATEGORIES: { label: string; value: FilterCategory }[] = [
  { label: "Tümü",     value: "tumumu"   },
  { label: "Heykel",   value: "heykel"   },
  { label: "Mimari",   value: "mimari"   },
  { label: "Karakter", value: "karakter" },
  { label: "Organik",  value: "organik"  },
  { label: "Makine",   value: "makine"   },
  { label: "Sanat",    value: "sanat"    },
];

const BADGE_LABEL: Record<string, string> = {
  "yeni":           "Yeni",
  "one-cikan":      "Öne Çıkan",
  "cok-indirilen":  "Çok İndirilen",
  "ucretsiz":       "Ücretsiz",
};

const BADGE_COLOR: Record<string, string> = {
  "yeni":          "#3b82f6",
  "one-cikan":     C.accent,
  "cok-indirilen": "#a855f7",
  "ucretsiz":      "#10b981",
};

// ── Eser Kartı ────────────────────────────────────────────────────────────────
function ArtworkCard({ artwork, onPress }: { artwork: ReturnType<typeof getAllArtworks>[0]; onPress: () => void }) {
  const badge = artwork.isFree ? "ucretsiz" : artwork.badge;
  const imgUrl = `https://picsum.photos/seed/${artwork.imageSeed}/400/500`;

  return (
    <Pressable onPress={onPress} style={s.card}>
      <View style={s.cardImgWrap}>
        <Image source={{ uri: imgUrl }} style={s.cardImg} resizeMode="cover" />
        {badge && (
          <View style={[s.badgePill, { backgroundColor: BADGE_COLOR[badge] ?? C.accent }]}>
            <Text style={s.badgeText}>{BADGE_LABEL[badge] ?? badge}</Text>
          </View>
        )}
        <View style={s.formatPill}>
          <Text style={s.formatText}>{artwork.fileFormat.toUpperCase()}</Text>
        </View>
      </View>
      <View style={s.cardInfo}>
        <Text style={s.cardTitle} numberOfLines={2}>{artwork.title}</Text>
        <Text style={s.cardArtist} numberOfLines={1}>{artwork.artistName}</Text>
        <View style={s.cardBottom}>
          <Text style={s.likesText}>♥ {artwork.likesCount.toLocaleString("tr-TR")}</Text>
          <Text style={[s.priceText, artwork.isFree && { color: "#10b981" }]}>
            {artwork.isFree ? "Ücretsiz" : `${artwork.price}₺`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ── Ana Sayfa ──────────────────────────────────────────────────────────────────
export default function SanatkatEkrani() {
  const router = useRouter();

  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState<FilterCategory>("tumumu");

  const allArtworks = getAllArtworks();
  const allArtists  = getAllArtists();

  const filtered = useMemo(() => {
    let list = category === "tumumu"
      ? allArtworks
      : allArtworks.filter((a) => a.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.title.toLowerCase().includes(q) || a.artistName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [category, search, allArtworks]);

  // Split into two columns for masonry effect
  const leftCol  = filtered.filter((_, i) => i % 2 === 0);
  const rightCol = filtered.filter((_, i) => i % 2 === 1);

  return (
    <View style={[s.root, { backgroundColor: C.background }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <Text style={s.heroSub}>Dijital Atölye</Text>
          <Text style={s.heroTitle}>Sanatkat</Text>
          <Text style={s.heroDesc}>
            {allArtworks.length} eser · {allArtists.length} sanatçı
          </Text>
        </View>

        {/* ── Search ─────────────────────────────────────────────────────── */}
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={15} color={C.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Eser veya sanatçı ara..."
            placeholderTextColor={C.mutedForeground}
            style={s.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={C.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* ── Category pills ─────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catScroll}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.value}
              onPress={() => setCategory(cat.value)}
              style={[s.catPill, category === cat.value && s.catPillActive]}
            >
              <Text style={[s.catPillText, category === cat.value && s.catPillTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Masonry Grid ───────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <View style={s.masonryRow}>
            {/* Left column */}
            <View style={s.masonryCol}>
              {leftCol.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onPress={() => router.push(`/eser/${artwork.slug}`)}
                />
              ))}
            </View>
            {/* Right column */}
            <View style={s.masonryCol}>
              {rightCol.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onPress={() => router.push(`/eser/${artwork.slug}`)}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>🎨</Text>
            <Text style={s.emptyTitle}>Eser bulunamadı</Text>
            <Text style={s.emptyDesc}>Farklı bir kategori veya arama deneyin</Text>
          </View>
        )}

        {/* ── Öne Çıkan Sanatçılar ───────────────────────────────────────── */}
        <View style={s.artistSection}>
          <Text style={s.sectionTitle}>Öne Çıkan Sanatçılar</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.artistScroll}
          >
            {allArtists.map((artist) => {
              const initials = artist.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
              return (
                <Pressable
                  key={artist.id}
                  onPress={() => router.push(`/sanatci/${artist.slug}`)}
                  style={s.artistCard}
                >
                  <View style={s.artistAvatar}>
                    <Text style={s.artistInitials}>{initials}</Text>
                  </View>
                  <Text style={s.artistName} numberOfLines={1}>{artist.name}</Text>
                  {artist.verified && (
                    <Text style={s.artistVerified}>✓ Doğrulanmış</Text>
                  )}
                  <Text style={s.artistWorks}>{artist.worksCount} eser</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingBottom: 24 },

  // Hero
  hero:     { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  heroSub:  { fontSize: FontSizes.xs, fontWeight: "700", color: C.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  heroTitle:{ fontSize: FontSizes["2xl"], fontWeight: "900", color: C.foreground, letterSpacing: -0.5 },
  heroDesc: { fontSize: FontSizes.xs, color: C.mutedForeground, marginTop: 4 },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: FontSizes.sm, color: C.foreground },

  // Categories
  catScroll:       { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  catPill:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface2 },
  catPillActive:   { backgroundColor: C.accent, borderColor: C.accent },
  catPillText:     { fontSize: FontSizes.sm, fontWeight: "600", color: C.mutedForeground },
  catPillTextActive:{ color: "#fff", fontWeight: "700" },

  // Masonry
  masonryRow: { flexDirection: "row", paddingHorizontal: 12, gap: 8 },
  masonryCol: { flex: 1, gap: 8 },

  // Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    overflow: "hidden",
  },
  cardImgWrap: { position: "relative" },
  cardImg:     { width: "100%", aspectRatio: 0.75 },
  badgePill: {
    position: "absolute", top: 7, left: 7,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText:  { fontSize: 9, fontWeight: "800", color: "#fff" },
  formatPill: {
    position: "absolute", top: 7, right: 7,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  formatText: { fontSize: 8, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  cardInfo:   { padding: 8, gap: 3 },
  cardTitle:  { fontSize: FontSizes.xs, fontWeight: "800", color: C.foreground, lineHeight: 15 },
  cardArtist: { fontSize: 9, color: C.mutedForeground },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  likesText:  { fontSize: 9, color: C.mutedForeground },
  priceText:  { fontSize: FontSizes.xs, fontWeight: "900", color: C.accent },

  // Empty
  emptyWrap:  { paddingVertical: 48, alignItems: "center", gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: FontSizes.md, fontWeight: "700", color: C.foreground },
  emptyDesc:  { fontSize: FontSizes.xs, color: C.mutedForeground, textAlign: "center", paddingHorizontal: 32 },

  // Artists
  artistSection: { paddingTop: 20, borderTopWidth: 1, borderTopColor: C.border, marginTop: 8 },
  sectionTitle:  { fontSize: FontSizes.md, fontWeight: "900", color: C.foreground, paddingHorizontal: 16, marginBottom: 12 },
  artistScroll:  { paddingHorizontal: 16, gap: 10 },
  artistCard:    { width: 90, alignItems: "center", gap: 4 },
  artistAvatar:  {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: `${C.accent}20`,
    borderWidth: 2, borderColor: `${C.accent}30`,
    alignItems: "center", justifyContent: "center",
  },
  artistInitials: { color: C.accent, fontSize: FontSizes.lg, fontWeight: "900" },
  artistName:     { fontSize: 10, fontWeight: "700", color: C.foreground, textAlign: "center" },
  artistVerified: { fontSize: 9, color: C.accent, fontWeight: "700" },
  artistWorks:    { fontSize: 9, color: C.mutedForeground },
});
