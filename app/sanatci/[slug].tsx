import { useState, useMemo, useCallback } from "react";
import {
  View, Text, Image, Pressable, FlatList,
  StyleSheet, StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Colors, FontSizes, LineHeights } from "@/constants/theme";
import { getArtist }           from "@/lib/mock-data/artists";
import { getArtworksByArtist } from "@/lib/mock-data/artworks";
import type { Artwork }        from "@/lib/mock-data/artworks";

const C = Colors.dark;

type ProfileTab = "eserler" | "hakkinda";

// ── Stat Kutusu ───────────────────────────────────────────────────────────────
function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={s.statBox}>
      <Text style={[s.statValue, accent && { color: C.accent }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ── Küçük Eser Kartı ──────────────────────────────────────────────────────────
function ArtworkThumb({ artwork, onPress }: { artwork: Artwork; onPress: () => void }) {
  const imgUrl = `https://picsum.photos/seed/${artwork.imageSeed}/400/500`;
  return (
    <Pressable onPress={onPress} style={s.thumbCard}>
      <Image source={{ uri: imgUrl }} style={s.thumbImg} resizeMode="cover" />
      <View style={s.thumbOverlay} />
      {artwork.isFree && (
        <View style={s.thumbFreeBadge}>
          <Text style={s.thumbBadgeText}>Ücretsiz</Text>
        </View>
      )}
      <View style={s.thumbInfo}>
        <Text style={s.thumbTitle} numberOfLines={2}>{artwork.title}</Text>
        <Text style={s.thumbPrice}>{artwork.isFree ? "Ücretsiz" : `${artwork.price}₺`}</Text>
      </View>
    </Pressable>
  );
}

// ── Ana Sayfa ─────────────────────────────────────────────────────────────────
export default function SanatciProfilSayfasi() {
  const { slug }  = useLocalSearchParams<{ slug: string }>();
  const router    = useRouter();
  const insets    = useSafeAreaInsets();

  const artist   = getArtist(slug ?? "");
  const artworks = useMemo(() => getArtworksByArtist(slug ?? ""), [slug]);

  const [activeTab,  setActiveTab]  = useState<ProfileTab>("eserler");
  const [following,  setFollowing]  = useState(false);

  const initials = artist?.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "??";

  // Split artworks into 2 columns for masonry grid
  const leftCol  = artworks.filter((_, i) => i % 2 === 0);
  const rightCol = artworks.filter((_, i) => i % 2 === 1);

  // FlatList header
  const ListHeader = useCallback(() => (
    <View>
      {/* Cover */}
      <View style={s.coverWrap}>
        <Image
          source={{ uri: `https://picsum.photos/seed/${artist?.coverSeed ?? "cover"}/1200/300` }}
          style={s.coverImage}
          resizeMode="cover"
        />
        <View style={s.coverOverlay} />
        <Pressable
          onPress={() => router.back()}
          style={[s.backBtn, { top: insets.top + 8 }]}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Avatar row */}
      <View style={s.avatarRow}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
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
            <Text style={s.msgBtnText}>✉️</Text>
          </Pressable>
        </View>
      </View>

      {/* Name + verified */}
      <View style={s.nameRow}>
        <Text style={s.artistName}>{artist?.name}</Text>
        {artist?.verified && (
          <View style={s.verifiedBadge}>
            <Text style={s.verifiedText}>✓ Doğrulanmış Sanatçı</Text>
          </View>
        )}
      </View>
      <Text style={s.artistMeta}>
        {`📍 ${artist?.location} · ${artist?.since}'den beri`}
      </Text>

      {/* Badges */}
      {artist && artist.badges.length > 0 && (
        <View style={s.badgeRow}>
          {artist.badges.map((b) => (
            <View key={b} style={s.badge}>
              <Text style={s.badgeText}>{b}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={s.statsRow}>
        <StatBox label="Takipçi"  value={(artist?.followersCount ?? 0).toLocaleString("tr-TR")} />
        <StatBox label="Beğeni"   value={(artist?.likesTotal ?? 0).toLocaleString("tr-TR")} accent />
        <StatBox label="Eser"     value={(artworks.length).toString()} />
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {(["eserler", "hakkinda"] as ProfileTab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[s.tab, activeTab === tab && s.tabActive]}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === "eserler" ? `Eserler (${artworks.length})` : "Hakkında"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Hakkında content */}
      {activeTab === "hakkinda" && artist && (
        <View style={s.aboutWrap}>
          <View style={s.aboutCard}>
            <Text style={s.aboutTitle}>Sanatçı Hakkında</Text>
            <Text style={s.aboutBio}>{artist.bio}</Text>
          </View>
          <View style={s.aboutCard}>
            <Text style={s.aboutTitle}>Uzmanlık Alanları</Text>
            <View style={s.specialtyRow}>
              {artist.specialties.map((sp) => (
                <View key={sp} style={s.specialtyPill}>
                  <Text style={s.specialtyText}>{sp}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Eserler: masonry header */}
      {activeTab === "eserler" && artworks.length > 0 && (
        <View style={s.masonryRow}>
          {/* Left column */}
          <View style={s.masonryCol}>
            {leftCol.map((aw) => (
              <ArtworkThumb
                key={aw.id}
                artwork={aw}
                onPress={() => router.push(`/eser/${aw.slug}`)}
              />
            ))}
          </View>
          {/* Right column */}
          <View style={s.masonryCol}>
            {rightCol.map((aw) => (
              <ArtworkThumb
                key={aw.id}
                artwork={aw}
                onPress={() => router.push(`/eser/${aw.slug}`)}
              />
            ))}
          </View>
        </View>
      )}

      {activeTab === "eserler" && artworks.length === 0 && (
        <View style={s.emptyWrap}>
          <Text style={s.emptyEmoji}>🎨</Text>
          <Text style={s.emptyTitle}>Henüz eser yok</Text>
        </View>
      )}
    </View>
  ), [artist, initials, following, activeTab, artworks, insets.top]);

  if (!artist) {
    return (
      <View style={[s.notFound, { paddingTop: insets.top + 16 }]}>
        <StatusBar barStyle="light-content" />
        <Pressable onPress={() => router.back()} style={s.backBtnPlain} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </Pressable>
        <Text style={s.notFoundEmoji}>🎨</Text>
        <Text style={s.notFoundTitle}>Sanatçı bulunamadı</Text>
        <Text style={s.notFoundSub}>Bu profil mevcut değil.</Text>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.background }]}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  coverWrap:    { height: 160, backgroundColor: C.surface2 },
  coverImage:   { width: "100%", height: "100%" },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  backBtn: {
    position: "absolute", left: 14,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center",
  },

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
  avatarText:  { color: C.accent, fontSize: FontSizes.lg, fontWeight: "900" },
  actionRow:   { flexDirection: "row", alignItems: "center", gap: 8 },
  followBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 12, backgroundColor: C.accent,
  },
  followBtnActive: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  followBtnText:   { color: "#fff", fontSize: FontSizes.sm, fontWeight: "700" },
  msgBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  msgBtnText: { fontSize: 16 },

  nameRow:      { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, paddingHorizontal: 16 },
  artistName:   { fontSize: FontSizes.xl, fontWeight: "900", color: C.foreground },
  verifiedBadge: { backgroundColor: C.accent, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  verifiedText:  { color: "#fff", fontSize: 9, fontWeight: "800" },
  artistMeta:   { fontSize: FontSizes.xs, color: C.mutedForeground, paddingHorizontal: 16, marginTop: 3 },

  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: 16, marginTop: 8 },
  badge:    { backgroundColor: `${C.accent}18`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:{ color: C.accent, fontSize: 10, fontWeight: "700" },

  statsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginTop: 12 },
  statBox: {
    flex: 1, backgroundColor: C.surface,
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
    padding: 10, alignItems: "center", gap: 2,
  },
  statValue: { fontSize: FontSizes.sm, fontWeight: "900", color: C.foreground },
  statLabel: { fontSize: 9, color: C.mutedForeground },

  tabRow: { flexDirection: "row", gap: 6, paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface2,
  },
  tabActive:     { backgroundColor: C.accent, borderColor: C.accent },
  tabText:       { fontSize: FontSizes.sm, fontWeight: "600", color: C.mutedForeground },
  tabTextActive: { color: "#fff", fontWeight: "700" },

  // Masonry
  masonryRow: { flexDirection: "row", paddingHorizontal: 12, gap: 8, marginTop: 8 },
  masonryCol: { flex: 1, gap: 8 },

  // Artwork thumb card
  thumbCard:      { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  thumbImg:       { width: "100%", aspectRatio: 0.75 },
  thumbOverlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  thumbFreeBadge: {
    position: "absolute", top: 7, left: 7,
    backgroundColor: "#10b981",
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 20,
  },
  thumbBadgeText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  thumbInfo: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  thumbTitle: { fontSize: 10, fontWeight: "700", color: "#fff", lineHeight: 14 },
  thumbPrice: { fontSize: 11, fontWeight: "900", color: C.accent, marginTop: 2 },

  // Empty
  emptyWrap:  { paddingVertical: 32, alignItems: "center", gap: 8 },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: FontSizes.md, fontWeight: "700", color: C.foreground },

  // About
  aboutWrap: { padding: 16, gap: 12 },
  aboutCard: {
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, padding: 16, gap: 10,
  },
  aboutTitle:    { fontSize: FontSizes.md, fontWeight: "800", color: C.foreground },
  aboutBio:      { fontSize: FontSizes.sm, color: C.mutedForeground, lineHeight: LineHeights.md },
  specialtyRow:  { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  specialtyPill: {
    backgroundColor: C.surface2, borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  specialtyText: { fontSize: FontSizes.xs, color: C.mutedForeground, fontWeight: "600" },

  // Not found
  notFound:      { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  backBtnPlain:  { position: "absolute", top: 16, left: 16 },
  notFoundEmoji: { fontSize: 56 },
  notFoundTitle: { fontSize: FontSizes["2xl"], fontWeight: "900", color: C.foreground },
  notFoundSub:   { fontSize: FontSizes.sm, color: C.mutedForeground },
});
